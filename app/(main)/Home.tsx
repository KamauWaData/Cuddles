import SwipeCard from "../../components/SwipeCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { likeProfile, unlikeProfile } from "../../lib/match";
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, TouchableOpacity, Image, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { boundingBox, haversineKm } from "../../lib/geo";
import CardStack from "../../components/CardStack";
import Icon from "@expo/vector-icons/Ionicons";
import BrandedLoading from "../../components/BrandedLoading";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_W = Dimensions.get("window").width;
const SCREEN_H = Dimensions.get("window").height;

export default function HomeScreen() {
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

  const fetchMyProfileAndCandidates = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id;
      if (!myId) {
        setLoading(false);
        console.log()
        return;
      }

      const { data: me, error: meErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", myId)
        .single();
      if (meErr) throw meErr;
      setUserProfile(me);

      const lat = me.latitude ?? 0;
      const lon = me.longitude ?? 0;
      const { minLat, maxLat, minLon, maxLon } = boundingBox(lat, lon, radiusKm);

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
        if (me.show_me && me.show_me.length > 0) {
          if (!me.show_me.includes(p.gender)) return false;
        }
        if (me.interests && me.interests.length > 0 && p.interests && p.interests.length > 0) {
          const overlap = p.interests.filter((i: string) => me.interests.includes(i));
          if (overlap.length === 0) return false;
        }
        const dist = haversineKm(lat, lon, p.latitude, p.longitude);
        (p as any).distanceKm = dist;
        return dist <= radiusKm;
      });

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

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(screens)/MyProfile")}
          >
            {userProfile?.avatar_url ? (
              <Image source={{ uri: userProfile.avatar_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Icon name="person" size={20} color="#FF3366" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>cuddles</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(screens)/filters")}
            >
              <Icon name="options-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={fetchMyProfileAndCandidates}>
              <Icon name="refresh-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContainer}>
          {candidates.length > 0 ? (
            <View style={styles.cardWrapper}>
              <CardStack items={candidates} onSwipe={onSwipe} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name="heart-dislike-outline" size={48} color="#FF3366" />
              </View>
              <Text style={styles.emptyTitle}>No more profiles</Text>
              <Text style={styles.emptySubtitle}>
                Check back later or adjust your filters to see more people
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchMyProfileAndCandidates}>
                <Icon name="refresh" size={20} color="#FF3366" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {candidates.length > 0 && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={() => currentProfile && handleDislike(currentProfile.id)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={28} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.superLikeButton]}
              onPress={() => currentProfile && handleSuperLike(currentProfile.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF3366", "#FF6B8A"]}
                style={styles.superLikeGradient}
              >
                <Icon name="star" size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => currentProfile && handleLike(currentProfile.id)}
              activeOpacity={0.8}
            >
              <Icon name="heart" size={28} color="#4ADE80" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFF0F5",
    borderWidth: 2,
    borderColor: "#FF3366",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF3366",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  cardWrapper: {
    width: SCREEN_W - 32,
    height: SCREEN_H * 0.55,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3366",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 120,
    gap: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dislikeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFE4E6",
  },
  likeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  superLikeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
  },
  superLikeGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
