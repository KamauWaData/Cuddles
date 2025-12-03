import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import SkipButton from "../../../components/onboarding/SkipButton";
import { useSession } from "../../../lib/useSession";
import { SafeAreaView } from "react-native-safe-area-context";

const INTEREST_OPTIONS = [
  "Sports", "Music", "Travel", "Movies", "Books", "Fitness", "Cooking", "Art",
  "Technology", "Gaming", "Swimming", "Hiking", "Dancing", "Yoga", "Photography",
  "Writing", "Cycling", "Meditation", "Crafts", "Gardening", "Shopping", "Theater",
  "Volunteering", "Fishing", "Running", "Skiing", "Surfing", "Martial Arts",
  "Board Games", "Puzzles", "Collecting", "Astrology", "Magic", "Robotics",
];

export default function Interests() {
  const router = useRouter();
  const { uid, profile } = useLocalSearchParams<{ uid: string; profile: string }>();
  const { session } = useSession();

  // Prefer route param `uid`, fall back to authenticated session user id
  const effectiveUid = (uid as string | undefined) ?? session?.user?.id;

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredInterests = useMemo(() => {
    if (!search.trim()) return INTEREST_OPTIONS;
    return INTEREST_OPTIONS.filter((i) =>
      i.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    if (selected.length < 3) {
      Alert.alert("Pick a few more!", "Select at least 3 interests to continue.");
      return;
    }

    try {
      const parsedProfile = profile ? JSON.parse(profile) : {};
      console.log("Interests handleContinue - parsedProfile:", parsedProfile);

      if (!effectiveUid) {
        Alert.alert("Missing user", "Unable to determine user id. Please sign in again.");
        return;
      }

      // Use snake_case field names that ProfileName.tsx now passes
      const userProfile = {
        id: effectiveUid,
        // Use snake_case column names to match the profiles table schema
        first_name: parsedProfile.first_name ?? null,
        last_name: parsedProfile.last_name ?? null,
        birthday: parsedProfile.birthday ?? null,
        avatar: parsedProfile.avatar ?? null,
        // Add onboarding fields
        gender: parsedProfile.gender ?? null,
        show_me: parsedProfile.show_me ?? [],
        interests: selected,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      console.log("Interests handleContinue - userProfile to upsert:", userProfile);

      const { error } = await supabase.from("profiles").upsert({ ...userProfile });

      if (error) {
        console.error("Supabase error:", error);
        Alert.alert("Couldn't save", "Please try again later.");
        return;
      }

      router.replace("/(main)/home");
    } catch (err: any) {
      console.error("Profile save error:", err);
      Alert.alert("Unexpected Error", err.message || "Please try again.");
    }
  };

  const handleSkip = async () => {
    try {
      if (!effectiveUid) {
        Alert.alert("Missing user", "Unable to determine user id. Please sign in again.");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: effectiveUid,
        interests: [],
        profile_complete: false,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase skip error:", error);
        Alert.alert("Couldn't skip", "Please try again later.");
        return;
      }

      router.replace("/(main)/home");
    } catch (err: any) {
      console.error("Skip error:", err);
      Alert.alert("Unexpected Error", err.message || "Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
  
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-pink-500">Back</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold">Your Interests</Text>

        <SkipButton to="/(main)/home" onSkip={handleSkip} />
      </View>
        {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-8 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-5/5" />
        </View>

        <Text className="text-2xl font-bold mb-2">Your Interests</Text>
        <Text className="text-gray-500 mb-6">
          Choose what you love — we’ll use this to find better matches.
        </Text>

        {/* Search bar */}
        <TextInput
          placeholder="Search interests..."
          value={search}
          onChangeText={setSearch}
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800"
        />

        {/* Interest chips */}
        <View className="flex-row flex-wrap gap-2">
          {filteredInterests.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.8}
                className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                  isSelected
                    ? "bg-pink-500 border-pink-500"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <Text
                  className={`${
                    isSelected ? "text-white" : "text-gray-700"
                  } text-[15px]`}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue */}
        <TouchableOpacity
          onPress={handleContinue}
          className={`mt-10 p-4 rounded-lg ${
            selected.length >= 3 ? "bg-pink-500" : "bg-gray-300"
          }`}
          disabled={selected.length < 3}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Finish
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
