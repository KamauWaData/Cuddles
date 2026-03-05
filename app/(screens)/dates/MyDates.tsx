// app/(main)/dates/MyDates.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "../../../components/LoadingSkeleton";

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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "500",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
    gap: 12,
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  dateContent: {
    padding: 16,
    gap: 14,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  dateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateTime: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtn: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#b45309",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#b91c1c",
  },
  viewBtn: {
    backgroundColor: "#FF3366",
    borderWidth: 1,
    borderColor: "#FF3366",
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  requestsSection: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 14,
  },
  requestsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  requestsList: {
    gap: 10,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  requesterInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  requesterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  requesterName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  requesterMessage: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  responseButtons: {
    flexDirection: "row",
    gap: 6,
  },
  responseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  rejectBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default function MyDates() {
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDates = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("scheduled_dates")
        .select("*, date_requests(id, requester_id, status, message, created_at, requester:profiles(id, first_name, avatar))")
        .eq("user_id", uid)
        .order("event_date", { ascending: false });

      if (error) {
        console.error("mydates fetch", error);
        setList([]);
      } else {
        // attach requests array
        setList((data || []).map((d: any) => ({ ...d, requests: d.date_requests || [] })));
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyDates(); }, [fetchMyDates]);

  const deletePost = (id: string, storagePath?: string | null) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // optionally remove storage
            if (storagePath) {
              await supabase.storage.from("dates").remove([storagePath]);
            }
            await supabase.from("scheduled_dates").delete().eq("id", id);
            setList((s) => s.filter((i) => i.id !== id));
          } catch (err) {
            console.error("delete post", err);
            Alert.alert("Delete failed");
          }
        },
      },
    ]);
  };

  const respondRequest = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      await supabase.from("date_requests").update({ status }).eq("id", requestId);
      await fetchMyDates();
      if (status === "accepted") {
        // fetch request to get ids
        const { data: req } = await supabase.from("date_requests").select("*").eq("id", requestId).single();
        if (!req) return;
        const ownerId = (await supabase.auth.getUser()).data?.user?.id;
        const requesterId = req.requester_id;
        const [a,b] = [ownerId, requesterId].sort();
        await supabase.from("matches").insert({ user_a: a, user_b: b }).select();
        const { data: matchRow } = await supabase.from("matches").select("id").or(`(user_a.eq.${a},user_b.eq.${b})`).single();
        if (matchRow?.id) {
          const { data: conv } = await supabase.from("conversations").insert({ match_id: matchRow.id }).select().single();
          if (conv?.id) router.push({ pathname: "/(main)/chat/[conversationId]", params: { conversationId: conv.id } });
        }
      }
    } catch (err) {
      console.error("respond req", err);
      Alert.alert("Failed to update request");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <SkeletonList count={3} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Dates</Text>
            <Text style={styles.headerSubtitle}>{list.length} posted</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(screens)/dates/ScheduleDate")}
            style={styles.addButton}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#FF3366", "#FF6B8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={48} color="#FF3366" />
            </View>
            <Text style={styles.emptyTitle}>No dates posted yet</Text>
            <Text style={styles.emptySubtitle}>Start by creating your first date event</Text>
            <TouchableOpacity
              onPress={() => router.push("/(screens)/dates/ScheduleDate")}
              style={styles.emptyButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#FF3366", "#FF6B8A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Post a Date</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.dateCard}>
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.dateImage} />
                )}
                <View style={styles.dateContent}>
                  <View>
                    <Text style={styles.dateTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.dateMetaRow}>
                      <Ionicons name="calendar" size={16} color="#FF3366" />
                      <Text style={styles.dateTime}>
                        {new Date(item.event_date).toLocaleDateString()} at{" "}
                        {new Date(item.event_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(screens)/dates/EditScheduleDate",
                          params: { id: item.id },
                        })
                      }
                      style={[styles.actionBtn, styles.editBtn]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pencil" size={16} color="#b45309" />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        deletePost(
                          item.id,
                          item.image_url
                            ? item.image_url.split("/dates/")[1]
                              ? `dates/${item.image_url.split("/dates/")[1]}`
                              : null
                            : null
                        )
                      }
                      style={[styles.actionBtn, styles.deleteBtn]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash" size={16} color="#b91c1c" />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(screens)/dates/details/[id]",
                          params: { id: item.id },
                        })
                      }
                      style={[styles.actionBtn, styles.viewBtn]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="eye" size={16} color="#fff" />
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Requests Section */}
                  {item.requests && item.requests.length > 0 && (
                    <View style={styles.requestsSection}>
                      <Text style={styles.requestsTitle}>
                        Requests ({item.requests.length})
                      </Text>
                      <View style={styles.requestsList}>
                        {item.requests.map((r: any) => (
                          <View key={r.id} style={styles.requestItem}>
                            <View style={styles.requesterInfo}>
                              {r.requester?.avatar ? (
                                <Image
                                  source={{ uri: r.requester.avatar }}
                                  style={styles.requesterAvatar}
                                />
                              ) : (
                                <View style={styles.avatarPlaceholder}>
                                  <Ionicons name="person" size={14} color="#FF3366" />
                                </View>
                              )}
                              <View style={{ flex: 1 }}>
                                <Text style={styles.requesterName}>
                                  {r.requester?.first_name || "Someone"}
                                </Text>
                                <Text style={styles.requesterMessage} numberOfLines={1}>
                                  {r.message}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.responseButtons}>
                              <TouchableOpacity
                                onPress={() => respondRequest(r.id, "accepted")}
                                style={[styles.responseBtn, styles.acceptBtn]}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="checkmark" size={14} color="#065f46" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => respondRequest(r.id, "rejected")}
                                style={[styles.responseBtn, styles.rejectBtn]}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="close" size={14} color="#b91c1c" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
