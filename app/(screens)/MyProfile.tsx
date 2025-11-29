import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import BrandedLoading from "../../components/BrandedLoading";


interface Profile {
  id: string;
  // name fields: different parts of the app use different keys
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  // avatar / images
  avatar?: string | null;
  gallery?: string[] | null;
  // profile details
  about?: string | null;
  interests?: string[] | null;
  // location / geo
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  // birthday stored as ISO date string in onboarding
  birthday?: string | null;
  profile_complete?: boolean | null;
}

export default function MyProfile() {
  const router = useRouter();
  const { session, loading } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // if session finished loading and there's no session, redirect to login
    if (!loading && !session) {
      router.replace("/(auth)/login");
      return;
    }

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, loading, session]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("fetchProfile error", error);
        setFetchError(error.message ?? "Failed to load profile");
        setProfile(null);
        return;
      }

      setProfile(data as Profile);
      setFetchError(null);
    } catch (err: any) {
      console.error("fetchProfile exception", err);
      setFetchError(err?.message ?? "Unknown error");
      setProfile(null);
    }
  };

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-white">
      <BrandedLoading message="Loading profile..." />
    </View>
  );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-700">{fetchError ?? "No profile found."}</Text>
        <View className="flex-row mt-4 space-x-3">
          <TouchableOpacity className="bg-pink-500 px-4 py-2 rounded" onPress={() => router.push("/(main)/EditProfile") }>
            <Text className="text-white">Create / Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-gray-300 px-4 py-2 rounded" onPress={() => fetchProfile()}>
            <Text className="text-gray-700">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        {profile.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            className="w-40 h-40 rounded-2xl"
          />
        ) : (
          <View className="w-40 h-40 bg-gray-200 rounded-2xl" />
        )}
      </View>

      {/* Basic Info */}
      <View className="items-center mt-3">
        {(() => {
          const displayName =
            profile.name ?? profile.full_name ?? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ?? "Your Name";
          const computeAge = (b?: string | null) => {
            if (!b) return null;
            const bd = new Date(b);
            const now = new Date();
            let age = now.getFullYear() - bd.getFullYear();
            const m = now.getMonth() - bd.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
            return age;
          };
          const age = computeAge(profile.birthday ?? null);
          return (
            <>
              <Text className="text-2xl font-bold">{displayName}{age ? `, ${age}` : ""}</Text>
              <Text className="text-gray-500">{profile.location ?? ""}</Text>
            </>
          );
        })()}
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
