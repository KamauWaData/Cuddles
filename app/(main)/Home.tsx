
import SwipeCard from "../../components/SwipeCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { likeProfile, dislikeProfile, superLikeProfile } from "../../lib/match";
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { boundingBox, haversineKm } from "../../lib/geo";
import CardStack from "../../components/CardStack"; // we'll add component below
import Icon from "@expo/vector-icons/Ionicons";
import BrandedLoading from "../../components/BrandedLoading";

const SCREEN_W = Dimensions.get("window").width;

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50); //default radius
  const mountedRef = useRef(true);

  const { minAge, maxAge, distance, gender} = useLocalSearchParams();
  
  const genderFilter = gender? JSON.parse(gender as string) : ["Man", "Woman"];

  const { data, error } = await supabase.rpc("search_profiles", {
    p_user_id: userProfile.id,
    p_min_age: Number(minAge) || 18,
    p_max_age: Number(maxAge) || 99,
    p_gender_filter: genderFilter,
    p_distance_km: Number(distance) || 50,
  });

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await fetchMyProfileAndCandidates();
    })();
    return () => { mountedRef.current = false; };
  }, []);

  const fetchMyProfileAndCandidates = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id;
      if (!myId) { setLoading(false); return; }

      // get my profile (includes show_me, interests, lat/lon)
      const { data: me, error: meErr} = await supabase
        .from("profiles")
        .select("*")
        .eq("id", myId)
        .single();
      if (meErr) throw meErr;
      setUserProfile(me);

      // bounding box
      const lat = me.latitude ?? 0;
      const lon = me.longitude ?? 0;
      const { minLat, maxLat, minLon, maxLon } = boundingBox(lat, lon, radiusKm);

      // fetch candidates roughly within box, excluding me
      const { data: rows, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", myId)
        .gte("latitude", minLat)
        .lte("latitude", maxLat)
        .gte("longitude", minLon)
        .lte("longitude", maxLon)
        .limit(200);

      if (error) throw error;

      const filtered = (rows || []).filter((p: any) => {
        if (!p.latitude || !p.longitude) return false;
        // gender filter: p.gender should be in my show_me OR I show everyone
        if (me.show_me && me.show_me.length > 0) {
            if (!me.show_me.includes(p.gender)) return false;
        }

        // interests overlap: optional, prefer at least 1 match if user has interests
        if (me.interests && me.interests.length > 0 && p.interests && p.interests.length > 0) {
          const overlap = p.interests.filter((i: string) => me.interests.includes(i));
          if (overlap.length === 0) {
            // allow but deprioritize — for now filter out (change to sort if you prefer)
            return false;
          }
        }
        // distance
        const dist = haversineKm(lat, lon, p.latitude, p.longitude);
        (p as any).distanceKm = dist;
        return dist <= radiusKm;
      })

        // sort by distance asc
        filtered.sort((a: any, b: any) => a.distanceKm - b.distanceKm);

          if (mountedRef.current) setCandidates(filtered);
        } catch (err) {
          console.error("discover fetch err", err);
        } finally {
          if (mountedRef.current) setLoading(false);
        }
      };

    async function getMyId() {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id;
    }

    async function handleDislike(targetId: string) {
      const myId = await getMyId();
      if (!myId) return;

      await dislikeProfile(myId, targetId); // Your backend RPC
      onNext(); // move to next card
    }

    async function handleLike(targetId: string) {
      const myId = await getMyId();
      if (!myId) return;

      const { matched, conversationId } = await likeProfile(myId, targetId);

      onNext(); // move to next card

      if (matched && conversationId) {
        setMatchedUser(currentProfile);
        setMatchConversationId(conversationId);
        setShowMatchModal(true);
      }
    }

    async function handleSuperLike(targetId: string) {
      const myId = await getMyId();
      if (!myId) return;

      const { matched, conversationId } = await superLikeProfile(myId, targetId);

      onNext(); 

      if (matched && conversationId) {
        setMatchedUser(currentProfile);
        setMatchConversationId(conversationId);
        setShowMatchModal(true);
      }
    }

    // called when user swipes
    const onSwipe = async (profileId: string, direction: "left" | "right", profileObj: any) => {
      if (direction === "right") {
        try {
          // insert like
          const { error } = await supabase
            .from("likes")
            .insert({ user_id: userProfile.id, liked_id: profileId })
            .select();
          if (error && error.code !== "23505") { // ignore duplicate unique violation
            console.error("like insert error", error);
          }

          // check if mutual like exists: does profileId like me?
          const { data: mutual } = await supabase
            .from("likes")
            .select("*")
            .eq("user_id", profileId)
            .eq("liked_id", userProfile.id)
            .single();

          if (mutual) {
            // create match (ensure unique order)
            const [a,b] = [userProfile.id, profileId].sort();
            const { error: matchErr } = await supabase
              .from("matches")
              .insert({ user_a: a, user_b: b })
              .select();
            if (matchErr && matchErr.code !== "23505") console.error("match create err", matchErr);

            // create conversation and route to chat
            // get the match id (try to fetch one)
            const { data: matchData } = await supabase
              .from("matches")
              .select("id")
              .or(`(user_a.eq.${a},user_b.eq.${b})`)
              .single();

            if (matchData?.id) {
              const { data: conv } = await supabase
                .from("conversations")
                .insert({ match_id: matchData.id })
                .select()
                .single();

              const convId = conv?.id ?? null;
              if (convId) {
                // navigate user to the new conversation (chat)
                router.push(`/ (main)/chat/${convId}`.replace(' / (main)','/(main'));
              }
            }
          }
        } catch (err) {
          console.error("onSwipe error", err);
        }
      }
    };
  
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <BrandedLoading message="Loading profiles..." />
        </View>
      )
    }

  return (
    <SafeAreaView className="flex-1 bg-pink-100">
      {/* header controls */}
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-xl font-bold">Discover</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => fetchMyProfileAndCandidates()}>
            <Icon name="refresh-outline" size={22} color="#444" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Top row: left icon and grouped right icons */}
      <View className="flex-row items-center justify-between px-6 mt-6">
        {/* left-aligned */}
        <TouchableOpacity className="rounded-full bg-white shadow p-3">
          <Icon name="person-outline" size={24} color="#FF3366" />
        </TouchableOpacity>

        {/* right-aligned group */}
          <View className="flex-row items-center space-x-3 ">
            <TouchableOpacity className="rounded-full bg-white shadow p-3">
              <Icon name="heart-outline" size={24} color="#FF3366" onPress={() => router.push('(screens)/filters')}/>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-full bg-white shadow p-3"
              onPress={() => router.push("/(screens)/Filters")}
            >
              <Icon name="filter-outline" size={24} color="#FF3366" onPress={() => router.push('(screens)/filters')}/>
            </TouchableOpacity>
          </View>
        </View>

        {/* card stack */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <CardStack items={candidates} onSwipe={onSwipe} />
        </View>

        {/* bottom nav / actions */}
        <View className="flex-row justify-center items-center mb-10 space-x-6">
        {/* Dislike */}
        <TouchableOpacity
          className="bg-white w-14 h-14 rounded-full shadow items-center justify-center"
          onPress={() => handleDislike(currentProfile.id)}
        >
          <Icon name="close" size={28} color="#FF3366" />
        </TouchableOpacity>

        {/* Super Like */}
        <TouchableOpacity
          className="bg-white w-16 h-16 rounded-full shadow items-center justify-center"
          onPress={() => handleSuperLike(currentProfile.id)}
        >
          <Icon name="star" size={32} color="#FF3366" />
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity
          className="bg-white w-14 h-14 rounded-full shadow items-center justify-center"
          onPress={() => handleLike(currentProfile.id)}
        >
          <Icon name="heart" size={28} color="#FF3366" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}