// ... (Your imports remain the same)
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

interface CandidateProfile {
  id: string;
  name: string;
  gender: string;
  avatar_url: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  age: number;
  interests: string[];
}


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
        {/* The header section is kept */}
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
              {/* 1. CardStack covers the main area of the wrapper */}
              <CardStack items={candidates} onSwipe={onSwipe} />
              
              {/* 2. Action Buttons are placed absolutely at the bottom of the wrapper */}
              <View style={styles.actionsContainer}>
                {/* Dislike Button (Cross/X) */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.dislikeButton]}
                  onPress={() => currentProfile && handleDislike(currentProfile.id)}
                  activeOpacity={0.8}
                >
                  <Icon name="close" size={28} color="#FF6B6B" /> 
                </TouchableOpacity>

                {/* Super Like Button (Star/Heart - The central, primary button) */}
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

                {/* Like Button (Heart) */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={() => currentProfile && handleLike(currentProfile.id)}
                  activeOpacity={0.8}
                >
                  <Icon name="heart" size={28} color="#FF3366" /> 
                </TouchableOpacity>
              </View>

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

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
// ... (Your existing styles remain the same up to cardContainer)

  // --- Card Area Modifications ---
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 10,
    // REMOVED marginBottom: 16; to let the card wrapper fill the space
  },
  cardWrapper: {
    // **KEY FIX: Need relative positioning for absolute children to work**
    position: 'relative', 
    width: SCREEN_W - 40,
    height: SCREEN_H * 0.65,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    // 'hidden' might crop the buttons if they stick out. Consider removing if issues arise.
    overflow: "hidden", 
  },
  
// ... (Empty State Styles remain the same)

  // --- Action Button Modifications ---
  actionsContainer: {
    // **KEY FIX: Use absolute positioning to float over the CardStack**
    position: "absolute",
    bottom: 25, // Distance from the bottom of the card wrapper
    left: 0,
    right: 0,
    
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30, 
    // Padding is no longer needed here since it's absolutely positioned
    // paddingBottom: 30, 
    // paddingHorizontal: 20, 
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: "#FFFFFF", 
  },
  // Small, simple buttons
  dislikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0, 
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0, 
  },
  // Large, central button (Super Like)
  superLikeButton: {
    width: 75, 
    height: 75,
    borderRadius: 37.5,
    overflow: "hidden",
  },
  superLikeGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

// new styles
container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // --- Existing Header Styles (Kept for completeness) ---
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
  // --- Empty State Styles (Kept) ---
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
});