// app/(main)/dates/ScheduledDates.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>Explore Dates</Text>
          <Text style={{ color: "#6b7280" }}>{items.length} upcoming</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(main)/dates/ScheduleDate")} style={{ backgroundColor: "#ec4899", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: "/(main)/dates/details/[id]", params: { id: item.id } })} style={{ marginBottom: 16, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff" }}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 160 }} /> : <View style={{ width: "100%", height: 160, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}><Ionicons name="calendar-outline" size={36} color="#cbd5e1" /></View>}
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
              <Text style={{ color: "#6b7280" }}>{item.location || "No location"}</Text>
              <Text style={{ color: "#94a3b8", marginTop: 6 }}>{new Date(item.event_date).toLocaleString()}</Text>

              {item.owner ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  {item.owner.avatar ? <Image source={{ uri: item.owner.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }} /> : null}
                  <Text style={{ fontWeight: "600" }}>{item.owner.first_name}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={{ padding: 24, alignItems: "center" }}><Text style={{ color: "#64748b" }}>No upcoming dates found.</Text></View>}
      />

      {/* Floating action button */}
      <TouchableOpacity onPress={() => router.push("/(main)/dates/ScheduleDate")} style={{
        position: "absolute", right: 20, bottom: Platform.OS === "ios" ? 36 : 16,
        width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center",
        backgroundColor: "#ec4899", elevation: 6
      }}>
        <Ionicons name="calendar" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
