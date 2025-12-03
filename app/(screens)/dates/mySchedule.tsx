// app/(main)/dates/MyDates.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

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
    return (<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#ec4899" /></View>);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>My Dates</Text>
        <TouchableOpacity onPress={() => router.push("/(main)/dates/ScheduleDate")} style={{ backgroundColor: "#ec4899", padding: 8, borderRadius: 10 }}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#eee", overflow: "hidden" }}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 140 }} /> : null}
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
              <Text style={{ color: "#6b7280" }}>{new Date(item.event_date).toLocaleString()}</Text>
              <View style={{ flexDirection: "row", marginTop: 8, justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => router.push({ pathname: "/(main)/dates/EditScheduleDate", params: { id: item.id } })} style={{ padding: 8, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#fde68a" }}>
                    <Text style={{ color: "#b45309" }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletePost(item.id, item.image_url ? item.image_url.split("/dates/")[1] ? `dates/${item.image_url.split("/dates/")[1]}` : null : null)} style={{ padding: 8, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#fecaca" }}>
                    <Text style={{ color: "#b91c1c" }}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push({ pathname: "/(main)/dates/details/[id]", params: { id: item.id } })} style={{ padding: 8, backgroundColor: "#ec4899", borderRadius: 8 }}>
                  <Text style={{ color: "#fff" }}>View</Text>
                </TouchableOpacity>
              </View>

              {/* requests */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "700" }}>Requests</Text>
                {(!item.requests || item.requests.length === 0) ? <Text style={{ color: "#94a3b8", marginTop: 6 }}>No requests yet</Text> : item.requests.map((r: any) => (
                  <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {r.requester?.avatar ? <Image source={{ uri: r.requester.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }} /> : null}
                      <View>
                        <Text style={{ fontWeight: "600" }}>{r.requester?.first_name || "Someone"}</Text>
                        <Text style={{ color: "#64748b" }}>{r.message}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity onPress={() => respondRequest(r.id, "accepted")} style={{ backgroundColor: "#bbf7d0", padding: 8, borderRadius: 8, marginRight: 8 }}>
                        <Text style={{ color: "#065f46" }}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => respondRequest(r.id, "rejected")} style={{ backgroundColor: "#f1f5f9", padding: 8, borderRadius: 8 }}>
                        <Text>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#64748b", textAlign: "center", marginTop: 24 }}>You haven't posted any dates yet.</Text>}
      />
    </View>
  );
}
