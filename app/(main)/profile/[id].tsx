// ...existing code...
import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const mockProfile = {
  id: "1",
  name: "Jessica Parker",
  age: 23,
  location: "Chicago, IL",
  bio: "Loves travel, coffee, and good conversation.",
  photos: [
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/women/69.jpg",
    "https://randomuser.me/api/portraits/women/70.jpg",
  ],
};

export default function Profile() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const data = mockProfile; // replace with fetch by id

  return (
    <ScrollView className="flex-1 bg-white">
      <Image source={{ uri: data.photos[0] }} className="w-full h-96" />
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold">
              {data.name}, {data.age}
            </Text>
            <Text className="text-gray-500">{data.location}</Text>
          </View>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="bg-white p-3 rounded-full shadow">
              <Text>✖</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-500 p-3 rounded-full shadow">
              <Text>❤</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white p-3 rounded-full shadow">
              <Text>★</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="mt-4 text-gray-700">{data.bio}</Text>

        <Text className="mt-4 font-semibold">Gallery</Text>
        <View className="flex-row flex-wrap mt-2">
          {data.photos.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(`/(main)/photo/${idx}`)}
              className="w-1/3 p-1"
            >
              <Image source={{ uri: p }} className="w-full h-24 rounded" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
// ...existing code...