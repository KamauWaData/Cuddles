import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Favorites() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from("favorites")
        .select("favorite:profiles(id, first_name, avatar)")
        .eq("user_id", userId);
      setList(data || []);
    } catch (err) {
      console.error("fetchFavorites error", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      await supabase.from("favorites").delete().eq("user_id", userId).eq("favorite_id", favoriteId);
      setList((prev) => prev.filter((item) => item.favorite.id !== favoriteId));
    } catch (err) {
      console.error("removeFavorite error", err);
    }
  };

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
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>{list.length} saved profile{list.length !== 1 ? "s" : ""}</Text>
        </View>

        {list.length > 0 ? (
          <FlatList
            data={list}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => item.favorite.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(screens)/profile/[id]", params: { id: item.favorite.id } })}
                style={styles.favoriteCard}
                activeOpacity={0.85}
              >
                {item.favorite.avatar ? (
                  <Image source={{ uri: item.favorite.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={32} color="#FF3366" />
                  </View>
                )}

                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.favorite.first_name || "User"}</Text>
                  <Text style={styles.savedLabel}>Saved to favorites</Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeFavorite(item.favorite.id)}
                  style={styles.removeButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart" size={20} color="#FF3366" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={48} color="#FF3366" />
            </View>
            <Text style={styles.emptyTitle}>No saved profiles yet</Text>
            <Text style={styles.emptySubtitle}>Like profiles to save them to your favorites</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  listContent: { paddingHorizontal: 12, paddingBottom: 20 },
  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 4 },
  savedLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
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
