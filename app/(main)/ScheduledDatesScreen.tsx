import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function ScheduledDates() {
  const router = useRouter();
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDates = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("dates")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) console.error(error);
    else setDates(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchDates();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Your Scheduled Dates</Text>
        <TouchableOpacity
          onPress={() => router.push("/(screens)/dates/ScheduleDate")}
          className="bg-pink-500 px-4 py-2 rounded"
        >
          <Text className="text-white font-semibold">+ Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {dates.length === 0 ? (
        <Text className="text-gray-500 mt-8 text-center">
          You haven’t scheduled any dates yet.
        </Text>
      ) : (
        <FlatList
          data={dates}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity className="border border-gray-200 rounded-lg mb-4 p-4">
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: 150, borderRadius: 8 }}
                  className="mb-3"
                />
              )}
              <Text className="text-lg font-semibold">{item.title}</Text>
              <Text className="text-gray-500">{item.location}</Text>
              <Text className="text-gray-400 mt-1">
                {new Date(item.date).toDateString()} —{" "}
                {new Date(item.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
