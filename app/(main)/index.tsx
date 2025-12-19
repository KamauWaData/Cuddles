// ... (Your imports remain the same)
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { likeProfile, unlikeProfile } from "../../lib/match";
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, TouchableOpacity, Image, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import CardStack from "../../components/CardStack";
import Icon from "@expo/vector-icons/Ionicons";
import BrandedLoading from "../../components/BrandedLoading";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
    console.log('[HomeScreen] Mounted');
      const router = useRouter();
      const [loading, setLoading] = useState(true);
      const [candidates, setCandidates] = useState<any[]>([]);
      const [userProfile, setUserProfile] = useState<any>(null);
      const [radiusKm, setRadiusKm] = useState<number>(50);
      const mountedRef = useRef(true);

      const { minAge, maxAge, distance, gender } = useLocalSearchParams();
      const genderFilter = gender ? JSON.parse(gender as string) : ["Man", "Woman"];

      const [matchedUser, setMatchedUser] = useState<any | null>(null);
      const [matchConversationId, setMatchConversationId] = useState<string | null>(null);
      const [showMatchModal, setShowMatchModal] = useState(false);

      const currentProfile = candidates[0] ?? null;
      const onNext = () => setCandidates((prev) => prev.slice(1));

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      await fetchMyProfileAndCandidates();
    })();
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
// ... fetchMyProfileAndCandidates and action handler functions (omitted for brevity)
  const fetchMyProfileAndCandidates = async () => {
  setLoading(true);
  try {
    console.log("[HomeScreen] fetchMyProfileAndCandidates start");

    // 1) get auth user id
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error("[HomeScreen] supabase.auth.getUser error:", authErr);
      setLoading(false);
      return;
    }
    const myId = authData?.user?.id;
    if (!myId) {
      console.warn("[HomeScreen] no authenticated user found");
      setLoading(false);
      return;
    }

    // 2) fetch my profile row and set it into state
    const { data: me, error: meErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", myId)
      .single();

    if (meErr) {
      console.error("[HomeScreen] error fetching my profile:", meErr);
      setLoading(false);
      return;
    }
    // update the component state the rest of your code expects
    setUserProfile(me);

    // 3) determine a simple gender filter (optional)
    // adapt strings to your DB values (e.g., "Man"/"Woman" or "male"/"female")
    let targetGenders: string[] | null = null;
    if (me?.gender) {
      const g = String(me.gender).toLowerCase();
      if (g === "man" || g === "male") targetGenders = ["Woman", "Female", "woman", "female"];
      else if (g === "woman" || g === "female") targetGenders = ["Man", "Male", "man", "male"];
      else targetGenders = null; // unknown gender -> fetch everyone
    }

    // 4) build the query
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("id", myId)
      .order("created_at", { ascending: false })
      .limit(200);

    // If you want to enforce profile completeness column name adjust below:
    // query = query.eq("profile_complete", true);

    // Apply gender filter if we determined a target
    if (targetGenders && targetGenders.length > 0) {
      // use .in to match multiple canonical values
      query = query.in("gender", targetGenders);
    }

    // 5) execute
    const { data: rows, error: rowsErr } = await query;
    if (rowsErr) {
      console.error("[HomeScreen] error fetching candidates:", rowsErr);
      setCandidates([]);
      setLoading(false);
      return;
    }

    console.log("[HomeScreen] raw fetched count:", (rows || []).length);

    // 6) Optional: basic filtering on client if you need (interests, show_me, age)
    // For now we keep it simple and only filter out any rows without an id
    const filtered = (rows || []).filter((p: any) => !!p?.id);

    // Optional: shuffle results so feed feels fresh (uncomment if desired)
    // const shuffled = filtered.sort(() => Math.random() - 0.5);

    // 7) set into state (use filtered or shuffled)
    if (mountedRef.current) setCandidates(filtered);

    console.log("[HomeScreen] final candidates count:", filtered.length);
  } catch (err) {
    console.error("[HomeScreen] unexpected error fetching candidates:", err);
    if (mountedRef.current) setCandidates([]);
  } finally {
    if (mountedRef.current) setLoading(false);
  }
};


  // ... existing action handlers (handleDislike, handleLike, handleSuperLike, onSwipe) (omitted for brevity)
  async function getMyId() {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id;
  }

  async function handleDislike(targetId: string) {
    const myId = await getMyId();
    if (!myId) return;
    await unlikeProfile(myId, targetId);
    onNext();
  }

  async function handleLike(targetId: string) {
    const myId = await getMyId();
    if (!myId) return;
    const { matched, conversationId } = await likeProfile(myId, targetId);
    onNext();
    if (matched && conversationId) {
      setMatchedUser(currentProfile);
      setMatchConversationId(conversationId);
      setShowMatchModal(true);
    }
  }

  const handleCardPress = () => {
    // Check if a profile is currently visible before navigating
    if (currentProfile) {
        // Use the correct dynamic route navigation format
        router.push(`/(screens)/profile/${currentProfile.id}`);
    }
};

  async function handleSuperLike(targetId: string) {
    const myId = await getMyId();
    if (!myId) return;
    const { matched, conversationId } = await likeProfile(myId, targetId, { superlike: true });
    onNext();
    if (matched && conversationId) {
      setMatchedUser(currentProfile);
      setMatchConversationId(conversationId);
      setShowMatchModal(true);
    }
  }

  const onSwipe = async (profileId: string, direction: "left" | "right", profileObj: any) => {
    if (direction === "right") {
      try {
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: userProfile.id, liked_id: profileId })
          .select();
        if (error && error.code !== "23505") {
          console.error("like insert error", error);
        }

        const { data: mutual } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", profileId)
          .eq("liked_id", userProfile.id)
          .single();

        if (mutual) {
          const [a, b] = [userProfile.id, profileId].sort();
          const { error: matchErr } = await supabase
            .from("matches")
            .insert({ user_a: a, user_b: b })
            .select();
          if (matchErr && matchErr.code !== "23505") console.error("match create err", matchErr);

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
              router.push(`/(screens)/chat/${convId}`);
            }
          }
        }
      } catch (err) {
        console.error("onSwipe error", err);
      }
    }
  };


  if (loading) {
    console.log();
    console.log('[HomeScreen] Loading...');
    return <BrandedLoading message="Finding matches for you..." />;
  }

  if (!userProfile) {
    console.log('[HomeScreen] No userProfile');
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fff'}}>
        <Text style={{color:'red',fontSize:18}}>Error: No user profile found</Text>
      </View>
    );
  }

 // ... (The code before the return statement remains the same)

// ...
  return (
        // Replaced style={styles.container} with className for gradient container
        <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} className="flex-1">
            {/* Replaced style={styles.safeArea} with className */}
            <SafeAreaView className="flex-1" edges={["top"]}>
                
                {/* 1. Header Section (styles.header and children converted) */}
                <View className="flex-row items-center justify-between px-5 py-3">
                    {/* Profile Button */}
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full overflow-hidden bg-pink-50 border-2 border-pink-600"
                        onPress={() => router.push("/(screens)/MyProfile")}
                    >
                        {userProfile?.avatar_url ? (
                            <Image source={{ uri: userProfile.avatar_url }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center">
                                <Icon name="person" size={20} color="#FF3366" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Logo */}
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-extrabold text-pink-600 tracking-tighter">cuddles</Text>
                    </View>

                    {/* Header Actions */}
                    <View className="flex-row space-x-2">
                        <TouchableOpacity
                            className="w-11 h-11 rounded-full bg-white items-center justify-center shadow"
                            onPress={() => router.push("/(screens)/filters")}
                        >
                            <Icon name="options-outline" size={22} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="w-11 h-11 rounded-full bg-white items-center justify-center shadow"
                            onPress={fetchMyProfileAndCandidates}
                        >
                            <Icon name="refresh-outline" size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Card Stack Area (styles.cardArea converted) */}
                <View className="flex-1 items-center justify-center">
                    {candidates.length > 0 ? (
                        <CardStack items={candidates} onSwipe={onSwipe} 
                        onCardPress={handleCardPress}/>
                        
                    ) : (
                
                        <View className="items-center p-8">
                            <View className="w-24 h-24 rounded-full bg-pink-50 items-center justify-center mb-6">
                                <Icon name="heart-dislike-outline" size={48} color="#FF3366" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800 mb-2">No more profiles</Text>
                            <Text className="text-base text-gray-500 text-center leading-relaxed mb-6">
                                Check back later or adjust your filters to see more people
                            </Text>
                            <TouchableOpacity className="flex-row items-center space-x-2 py-3 px-6 bg-pink-50 rounded-xl" onPress={fetchMyProfileAndCandidates}>
                                <Icon name="refresh" size={20} color="#FF3366" />
                                <Text className="text-base font-semibold text-pink-600">Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* 3. Action Buttons (styles.actionRow and children converted) */}
                {candidates.length > 0 && (
                    <View className="flex-row justify-center items-center mb-10 space-x-6">
                        {/* Dislike Button (smallActionButton) */}
                        <TouchableOpacity
                            className="bg-white w-14 h-14 rounded-full shadow items-center justify-center"
                            onPress={() => currentProfile && handleDislike(currentProfile.id)}
                            activeOpacity={0.8}
                        >
                            <Icon name="close" size={28} color="#FF3366" />
                        </TouchableOpacity>

                        {/* Super Like Button (largeActionButton) */}
                        <TouchableOpacity
                            className="bg-white w-16 h-16 rounded-full shadow items-center justify-center"
                            onPress={() => currentProfile && handleSuperLike(currentProfile.id)}
                            activeOpacity={0.8}
                        >
                            <Icon name="star" size={32} color="#FF3366" />
                        </TouchableOpacity>

                        {/* Like Button (smallActionButton) */}
                        <TouchableOpacity
                            className="bg-white w-14 h-14 rounded-full shadow items-center justify-center"
                            onPress={() => currentProfile && handleLike(currentProfile.id)}
                            activeOpacity={0.8}
                        >
                            <Icon name="heart" size={28} color="#FF3366" />
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
  );
}
