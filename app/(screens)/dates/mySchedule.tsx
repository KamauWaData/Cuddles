import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";

type DateItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  image_url?: string;
  event_date: string;
  created_at?: string;
};

type Request = {
  id: string;
  requester_id: string;
  status: string;
  message?: string;
  created_at?: string;
  requester_profile?: any;
};

export default function MyDates() {
  const router = useRouter();
  const [dates, setDates] = useState<DateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDates = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from<DateItem>("scheduled_dates")
        .select("*, date_requests(id, requester_id, status, message, created_at, requester:profiles(id, first_name, avatar))")
        .eq("user_id", userId)
        .order("event_date", { ascending: false});

        if (error) {
          console.error("fetchMyDates error:", error);
          setDates([]);
        } else {
          // restructure so requests are available per item
          const withRequests = (data || []).map((d: any) => ({
            ...d,
            requests: d.date_requests || [],
          }));
           setDates(withRequests);
        }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDates();
  }, [fetchMyDates]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete date", "Are you sure you want to delete this date?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("scheduled_dates").delete().eq("id", id);
          if (error) Alert.alert("Delete failed");
          else {
            setDates((s) => s.filter((x) => x.id !== id));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-2xl p-4 mb-4">
      {item.image_url ? <Image source={{ uri: item.image_url }} style={{  width: "100%", height: 160, borderRadius: 8 }} /> : null }
      <Text className="text-lg font-semibold mt-3">{item.title}</Text>
      <Text className="text-gray-500">{item.location}</Text>
      <Text className="text-gray-400 mt-1">{new Date(item.event_date).toLocaleString()}</Text>

      {/* Action row */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity onPress={() => router.push({ pathname: "/(main)/dates/details/[id]", params: { id: item.id } })} className="px-3 py-2 bg-gray-100 rounded">
            <Text>View</Text>
          </TouchableOpacity>

          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={() => router.push({ pathname: "/(main)/dates/ScheduleDate", params: { id: item.id } })} className="px-3 py-2 bg-pink-100 rounded">
              <Text className="text-pink-600">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item.id)} className="px-3 py-2 bg-red-100 rounded">
              <Text className="text-red-600">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* requests preview */}
        <View className="mt-3">
          <Text className="font-semibold">Requests</Text>
          {(item.requests?.length || 0) === 0 ? (
            <Text className="text-gray-500 mt-1">No requests yet</Text>
          ) : (
            item.requests.map((r: Request) => (
              <View key={r.id} className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center">
                {r.requester_profile?.avatar ? (
                  <Image source={{ uri: r.requester_profile.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                ) : null}
                <View className="ml-2">
                  <Text className="font-medium">{r.requester_profile?.first_name || "Someone"}</Text>
                  <Text className="text-gray-500 text-sm">{r.message || ""}</Text>
                </View>
              </View>

                <View className="flex-row space-x-2">
                  <TouchableOpacity onPress={() => respondRequest(r.id, "accepted", item.id)} className="px-2 py-1 bg-green-100 rounded">
                    <Text className="text-green-600">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => respondRequest(r.id, "rejected", item.id)} className="px-2 py-1 bg-gray-100 rounded">
                    <Text>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
    </View>
  );

  // accept/reject request handler
  const respondRequest = async (requestId: string, status: "accepted" | "rejected" | "cancelled", scheduledDateId?: string) => {
    try {
      // update request
      const { error } = await supabase.from("date_requests").update({ status }).eq("id", requestId);
      if (error) throw error;

      // refresh list
      await fetchMyDates();

      // if accepted -> create conversation between owner and requester
      if (status === "accepted") {
        // fetch request to get requester id
        const { data: req } = await supabase.from("date_requests").select("*").eq("id", requestId).single();
        if (!req) return;
        const requesterId = req.requester_id;
        const ownerId = (await supabase.auth.getUser()).data?.user?.id;

        // create match entry (optional) and conversation
        const [a, b] = [ownerId, requesterId].sort();
        await supabase.from("matches").insert({ user_a: a, user_b: b }).select();
        const { data: matchRow } = await supabase.from("matches").select("id").or(`(user_a.eq.${a},user_b.eq.${b})`).single();

        if (matchRow?.id) {
          const { data: conv } = await supabase.from("conversations").insert({ match_id: matchRow.id }).select().single();
          if (conv?.id) {
            // navigate to chat with the conversation
            router.push({ pathname: "/(main)/chat/[conversationId]", params: { conversationId: conv.id } });
          }
        }
      }
    } catch (err) {
      console.error("respondRequest error", err);
      Alert.alert("Failed to respond to request");
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">My Dates</Text>
        <TouchableOpacity onPress={() => router.push("/(main)/dates/ScheduleDate")} className="bg-pink-500 px-3 py-2 rounded">
          <Text className="text-white">+ Schedule</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={dates} keyExtractor={(i) => i.id} renderItem={renderItem} ListEmptyComponent={<Text className="text-gray-500 mt-8 text-center">You have not posted any dates yet.</Text>} />
    </View>
  );
}