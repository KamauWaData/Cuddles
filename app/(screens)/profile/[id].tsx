import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    setProfile(data);
  };

  if (!profile) return null;

  return (
    <ScrollView className="flex-1 bg-white">

      {/* Hero Image */}
      <Image
        source={{ uri: profile.avatar }}
        className="w-full h-[480px]"
      />

      {/* Action buttons */}
      <View className="flex-row justify-center -mt-10 gap-4">
        <TouchableOpacity className="bg-white p-4 rounded-full shadow">
          <Text className="text-xl">✖</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-pink-500 p-5 rounded-full shadow">
          <Text className="text-white text-2xl">❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-full shadow">
          <Text className="text-xl">⭐</Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-6">

        {/* Name & Location */}
        <Text className="text-3xl font-bold">
          {profile.name}, {profile.age}
        </Text>
        <Text className="text-gray-500">{profile.location}</Text>

        {/* About */}
        <View className="mt-6">
          <Text className="font-bold text-lg mb-1">About</Text>
          <Text className="text-gray-600">{profile.about}</Text>
        </View>

        {/* Interests */}
        <View className="mt-6">
          <Text className="font-bold text-lg mb-2">Interests</Text>
          <View className="flex-row flex-wrap gap-2">
            {profile.interests?.map((i: string) => (
              <View key={i} className="bg-pink-100 px-3 py-1 rounded-full">
                <Text className="text-pink-600">{i}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gallery */}
        <View className="mt-6 mb-20">
          <Text className="font-bold text-lg mb-2">Gallery</Text>
          <View className="flex-row flex-wrap gap-2">
            {profile.gallery?.map((pic: string) => (
              <Image
                key={pic}
                source={{ uri: pic }}
                className="w-[30%] h-32 rounded-xl"
              />
            ))}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
