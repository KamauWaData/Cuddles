// app/(main)/ScheduledDates.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduledDates() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const myId = auth?.user?.id || null;

      // fetch upcoming dates from other users (includes owner profile via join)
      const { data, error } = await supabase
        .from("scheduled_dates")
        .select(`
          id, title, description, location, event_date, image_url, created_at,
          owner:profiles(id, first_name, avatar)
        `)
        .gte("event_date", new Date().toISOString())
        .eq("is_active", true)
        .neq("user_id", myId)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("ScheduledDates fetch error", error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("fetch scheduled dates", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Explore Dates</Text>
            <Text style={styles.headerSubtitle}>{items.length} upcoming date{items.length !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(main)/dates/ScheduleDate")}
            style={styles.headerButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dates List */}
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(main)/dates/details/[id]", params: { id: item.id } })}
              style={styles.dateCard}
              activeOpacity={0.85}
            >
              {/* Image Section */}
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.dateImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="calendar-outline" size={40} color="#FF3366" />
                </View>
              )}

              {/* Content Section */}
              <View style={styles.dateContent}>
                <Text style={styles.dateTitle} numberOfLines={1}>{item.title}</Text>

                <View style={styles.dateInfoRow}>
                  <Ionicons name="location-outline" size={16} color="#FF3366" />
                  <Text style={styles.dateLocation} numberOfLines={1}>
                    {item.location || "No location specified"}
                  </Text>
                </View>

                <View style={styles.dateInfoRow}>
                  <Ionicons name="time-outline" size={16} color="#FF3366" />
                  <Text style={styles.dateTime}>
                    {new Date(item.event_date).toLocaleDateString()} at {new Date(item.event_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>

                {/* Host Info */}
                {item.owner ? (
                  <View style={styles.ownerSection}>
                    {item.owner.avatar ? (
                      <Image source={{ uri: item.owner.avatar }} style={styles.ownerAvatar} />
                    ) : (
                      <View style={styles.ownerAvatarPlaceholder}>
                        <Text>👤</Text>
                      </View>
                    )}
                    <Text style={styles.ownerName}>{item.owner.first_name}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color="#FF3366" />
              </View>
              <Text style={styles.emptyTitle}>No upcoming dates</Text>
              <Text style={styles.emptySubtitle}>Check back later for new date ideas</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/dates/ScheduleDate")}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#ff69b4", "#ff1493"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  dateCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dateImage: {
    width: "100%",
    height: 160,
  },
  placeholderImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  dateContent: {
    padding: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  dateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  dateTime: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  ownerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  ownerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 100 : 80,
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
