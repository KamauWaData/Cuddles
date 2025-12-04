import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { blockUser, reportUser } from "../../../lib/block";

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

  const handleBlock = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const me = auth?.user?.id;
    if (!me) { Alert.alert("Sign in"); return; }
    await blockUser(me, profile.id);
    Alert.alert("Blocked", "User has been blocked. You won't see them again.");
    router.back();
  };

 const handleReport = async () => {
    // simple prompt: ask user for reason or send default
    // get current user id (same pattern as handleBlock)
    const { data: auth } = await supabase.auth.getUser();
    const me = auth?.user?.id;
    if (!me) { Alert.alert("Sign in"); return; }
    // simple prompt: ask user for reason or send default
    await reportUser(me, profile.id, "Inappropriate behaviour");
    Alert.alert("Reported", "Thanks for flagging. We'll review this user.");
  };
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        {/* Card Layout */}
        <View className="w-11/12 bg-white rounded-3xl shadow-lg mt-6 overflow-hidden">
          {/* Hero Image with fade-in */}
          <Image
            source={{ uri: profile.avatar }}
            className="w-full h-80 bg-gray-200"
            style={{ resizeMode: 'cover' }}
          />
          {/* Action Buttons */}
          <View className="flex-row justify-center -mt-8 z-10 gap-6">
            <TouchableOpacity className="bg-white p-5 rounded-full shadow-lg border border-gray-200 active:bg-gray-100" activeOpacity={0.7}>
              <Text className="text-2xl text-gray-400">✖</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-500 p-6 rounded-full shadow-lg border-2 border-white active:bg-pink-600" activeOpacity={0.8}>
              <Text className="text-3xl text-white">❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white p-5 rounded-full shadow-lg border border-gray-200 active:bg-gray-100" activeOpacity={0.7}>
              <Text className="text-2xl text-yellow-400">⭐</Text>
            </TouchableOpacity>
          </View>
          {/* Profile Info */}
          <View className="px-6 pt-8 pb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-3xl font-bold text-gray-900">
                {profile.name}
                {profile.age ? `, ${profile.age}` : ''}
              </Text>
              {profile.is_verified && (
                <Text className="ml-2 text-blue-500 text-lg">✔️</Text>
              )}
            </View>
            <Text className="text-gray-500 mb-2">{profile.location}</Text>
            {/* About */}
            {profile.about && (
              <View className="mb-4">
                <Text className="font-bold text-lg mb-1">About</Text>
                <Text className="text-gray-600 leading-relaxed">{profile.about}</Text>
              </View>
            )}
            {/* Interests */}
            {profile.interests?.length > 0 && (
              <View className="mb-4">
                <Text className="font-bold text-lg mb-2">Interests</Text>
                <View className="flex-row flex-wrap gap-2">
                  {profile.interests.map((i: string) => (
                    <View key={i} className="bg-pink-100 px-3 py-1 rounded-full">
                      <Text className="text-pink-600 text-sm font-medium">{i}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Gallery */}
            {profile.gallery?.length > 0 && (
              <View className="mb-2">
                <Text className="font-bold text-lg mb-2">Gallery</Text>
                <View className="flex-row flex-wrap gap-2">
                  {profile.gallery.map((pic: string) => (
                    <Image
                      key={pic}
                      source={{ uri: pic }}
                      className="w-[30%] h-28 rounded-xl bg-gray-100"
                      style={{ resizeMode: 'cover' }}
                    />
                  ))}
                </View>
              </View>
            )}
            {/* Block/Report */}
            <View className="flex-row gap-6 mt-6 justify-center">
              <TouchableOpacity onPress={handleBlock} className="px-4 py-2 rounded-lg bg-red-50">
                <Text className="text-red-500 font-semibold">Block</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport} className="px-4 py-2 rounded-lg bg-gray-100">
                <Text className="text-gray-700 font-semibold">Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
