import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export default function MyProfile() {
  const router = useRouter();
  const user = useUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .single();

    setProfile(data);
  };

  if (!profile) return null;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-end p-4">
        <TouchableOpacity
          onPress={() => router.push("/(main)/settings")}
        >
          <Text className="text-pink-600 text-lg">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <View className="items-center mt-4">
        <Image
          source={{ uri: profile.avatar }}
          className="w-40 h-40 rounded-2xl"
        />
      </View>

      {/* Basic Info */}
      <View className="items-center mt-3">
        <Text className="text-2xl font-bold">
          {profile.name}, {profile.age}
        </Text>
        <Text className="text-gray-500">{profile.location}</Text>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(main)/EditProfile",
            params: { data: JSON.stringify(profile) },
          })
        }
        className="bg-pink-500 mx-6 mt-6 p-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Edit Profile</Text>
      </TouchableOpacity>

      {/* About */}
      <View className="mt-6 px-6">
        <Text className="font-bold text-lg mb-2">About</Text>
        <Text className="text-gray-600">{profile.about}</Text>
      </View>

      {/* Interests */}
      <View className="mt-6 px-6">
        <Text className="font-bold text-lg mb-2">Interests</Text>
        <View className="flex-row flex-wrap gap-2">
          {profile.interests?.map((i) => (
            <View
              key={i}
              className="bg-pink-100 px-3 py-1 rounded-full"
            >
              <Text className="text-pink-600">{i}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Gallery */}
      <View className="mt-6 px-6 mb-20">
        <Text className="font-bold text-lg mb-2">Gallery</Text>
        <View className="flex-row flex-wrap gap-2">
          {profile.gallery?.map((pic) => (
            <Image
              key={pic}
              source={{ uri: pic }}
              className="w-[30%] h-32 rounded-xl"
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
