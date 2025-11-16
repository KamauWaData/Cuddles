import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "expo-router";

export default function ScheduledDates() {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("dates")
        .select(`
          id,
          title,
          description,
          location,
          date,
          image_url,
          created_at,
          profiles (
            id,
            firstName,
            avatar
          )
        `)
        .neq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setDates(data || []);
    } catch (err) {
      console.error("Error fetching dates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const renderCard = (item: any) => (
    <View key={item.id} className="bg-white rounded-2xl shadow p-4 mb-4">
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-48 rounded-xl mb-3"
        />
      )}
      <Text className="text-lg font-bold text-gray-900">{item.title}</Text>
      <Text className="text-gray-500 mb-2">{item.location}</Text>
      <Text className="text-gray-600 mb-3">{new Date(item.date).toDateString()}</Text>
      {item.profiles && (
        <View className="flex-row items-center mt-2">
          {item.profiles.avatar && (
            <Image
              source={{ uri: item.profiles.avatar }}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <Text className="text-gray-800 font-medium">{item.profiles.firstName}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Upcoming Dates</Text>
        <TouchableOpacity
          onPress={() => router.push("/(main)/schedule-date")}
          className="bg-pink-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">+ Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {dates.length > 0 ? (
          dates.map(renderCard)
        ) : (
          <Text className="text-gray-500 text-center mt-10">
            No scheduled dates available.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
