import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const LikesScreen = () => {
  const [tab, setTab] = useState("likesYou");
  const [likesYou, setLikesYou] = useState([]);
  const [youLiked, setYouLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLikes();
  }, []);

  async function fetchLikes() {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      const [likesYouRes, youLikedRes] = await Promise.all([
        supabase.from("likes").select("from_user").eq("to_user", userId),
        supabase.from("likes").select("to_user").eq("from_user", userId),
      ]);

      const likesYouIds = likesYouRes.data?.map((x: any) => x.from_user) || [];
      const youLikedIds = youLikedRes.data?.map((x: any) => x.to_user) || [];

      const [likesYouProfiles, youLikedProfiles] = await Promise.all([
        likesYouIds.length > 0
          ? supabase.from("profiles").select("*").in("id", likesYouIds)
          : Promise.resolve({ data: [] }),
        youLikedIds.length > 0
          ? supabase.from("profiles").select("*").in("id", youLikedIds)
          : Promise.resolve({ data: [] }),
      ]);

      setLikesYou(likesYouProfiles.data || []);
      setYouLiked(youLikedProfiles.data || []);
    } catch (err) {
      console.error("fetchLikes error", err);
    } finally {
      setLoading(false);
    }
  }

  const list = tab === "likesYou" ? likesYou : youLiked;

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Likes</Text>
          <Text style={styles.headerSubtitle}>{list.length} profile{list.length !== 1 ? "s" : ""}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setTab("likesYou")}
            style={[styles.tab, tab === "likesYou" && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Ionicons name={tab === "likesYou" ? "heart" : "heart-outline"} size={18} color={tab === "likesYou" ? "#FF3366" : "#9CA3AF"} />
            <Text style={[styles.tabText, tab === "likesYou" && styles.tabTextActive]}>Likes You</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab("youLiked")}
            style={[styles.tab, tab === "youLiked" && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Ionicons name={tab === "youLiked" ? "heart" : "heart-outline"} size={18} color={tab === "youLiked" ? "#FF3366" : "#9CA3AF"} />
            <Text style={[styles.tabText, tab === "youLiked" && styles.tabTextActive]}>You Liked</Text>
          </TouchableOpacity>
        </View>

        {/* Grid */}
        {list.length > 0 ? (
          <FlatList
            data={list}
            numColumns={2}
            scrollEnabled={true}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(screens)/profile/[id]", params: { id: item.id } })}
                style={styles.profileCard}
                activeOpacity={0.85}
              >
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="person" size={48} color="#FF3366" />
                  </View>
                )}
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {item.first_name || "Profile"}
                  </Text>
                  <View style={styles.likeIndicator}>
                    <Ionicons name="heart" size={14} color="#FF3366" />
                    <Text style={styles.likeText}>Liked</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={48} color="#FF3366" />
            </View>
            <Text style={styles.emptyTitle}>{tab === "likesYou" ? "No likes yet" : "You haven't liked anyone"}</Text>
            <Text style={styles.emptySubtitle}>
              {tab === "likesYou" ? "When someone likes you, they'll appear here" : "Like profiles to see them here"}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  tabActive: {
    borderColor: "#FF3366",
    backgroundColor: "#FFF0F5",
  },
  tabText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  tabTextActive: { color: "#FF3366" },
  gridContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  columnWrapper: { gap: 8, marginBottom: 8 },
  profileCard: {
    flex: 0.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    aspectRatio: 0.9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: { width: "100%", height: "70%" },
  imagePlaceholder: {
    width: "100%",
    height: "70%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { height: "30%", paddingHorizontal: 10, paddingVertical: 8, justifyContent: "space-between" },
  profileName: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  likeIndicator: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeText: { fontSize: 12, fontWeight: "600", color: "#FF3366" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22 },
});

export default LikesScreen;
