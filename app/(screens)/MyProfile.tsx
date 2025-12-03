import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabase";
import React, { useEffect, useState } from "react";
import BrandedLoading from "../../components/BrandedLoading";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/build/Feather";

// Set your storage bucket name (change if different)
const AVATAR_BUCKET = "avatars";

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  avatar?: string | null;    // can be complete URL or storage object name
  gallery?: string[] | null;
  about?: string | null;
  interests?: string[] | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  birthday?: string | null;
  profile_complete?: boolean | null;
}

export default function MyProfile() {
  const router = useRouter();
  const { session, loading } = useSession();
  const user = session?.user;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/(auth)/login");
      return;
    }
    if (user?.id) fetchProfile();
  }, [user?.id, loading]);

  // Fetch profile row
  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setFetchError(error.message ?? "Failed to load profile");
        setProfile(null);
        return;
      }

      setProfile(data);
      setFetchError(null);

      // Resolve avatar URL after fetching profile
      if (data?.avatar) resolveAvatarUrl(data.avatar);

    } catch (err: any) {
      setFetchError(err?.message ?? "Unknown error");
      setProfile(null);
    }
  };

  // Turn a Supabase storage path into a public URL
  const resolveAvatarUrl = async (avatarValue: string) => {
    try {
      // If avatar is already a full URL (Cloudinary, etc.)
      if (avatarValue.startsWith("http")) {
        setAvatarUrl(avatarValue);
        return;
      }

      // Otherwise treat it as a storage object path: "avatars/USER-ID.jpg"
      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(avatarValue);

      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
      } else {
        setAvatarUrl(null);
      }

    } catch (err) {
      console.error("resolveAvatarUrl error:", err);
      setAvatarUrl(null);
    }
  };

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <BrandedLoading message="Loading profile..." />
      </View>
    );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-700">
          {fetchError ?? "No profile found."}
        </Text>
        <View className="flex-row mt-4 space-x-3">
          <TouchableOpacity
            className="bg-pink-500 px-4 py-2 rounded"
            onPress={() => router.push("/(main)/EditProfile")}
          >
            <Text className="text-white">Create / Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 px-4 py-2 rounded"
            onPress={fetchProfile}
          >
            <Text className="text-gray-700">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Utility: compute display name + age
  const displayName =
    profile.name ??
    profile.full_name ??
    `${profile.first_name ?? ""}${
      profile.first_name && profile.last_name ? " " : ""
    }${profile.last_name ?? ""}`.trim() ??
    "Your Name";

  const computeAge = (b?: string | null) => {
    if (!b) return null;
    const bd = new Date(b);
    const now = new Date();
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return age;
  };

  const age = computeAge(profile.birthday);

  return (
    <SafeAreaView className="flex-1 bg-pink-100">
    
      {/* Avatar */}
      <View className="items-center mt-6 w-11/12 h-60 rounded-2xl overflow-hidden self-center">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-full h-60 rounded-2xl"
          />
        ) : (
          <View className="w-full h-60 bg-gray-200 rounded-2xl" />
        )}
      </View>

      {/* Info Row */}
      <View className="flex-row items-center justify-between px-5 mt-5">
        <View className="flex-row items-center space-x-2">
          <Text className="text-2xl font-bold">
            {displayName}
            {age ? `, ${age}` : ""}
          </Text>
          <Text className="text-gray-500">{profile.location ?? ""}</Text>
        </View>

        {/* RIGHT: Edit + Settings */}
        <View className="flex-row items-center space-x-5">
          <TouchableOpacity onPress={() =>
            router.push({
              pathname: "/(screens)/profile/EditProfile",
              params: { data: JSON.stringify(profile) },
            })
          }>
            <Feather name="edit-3" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(screens)/settings")}>
            <Feather name="settings" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View className="mt-4 px-6">
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
              className="bg-pink-200 px-3 py-1 rounded-full"
            >
              <Text className="text-pink-700">{i}</Text>
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
    
    </SafeAreaView>
  );
}
