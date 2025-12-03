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
import { LinearGradient } from "expo-linear-gradient";
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

      router.replace("/(main)/Home");
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

      router.replace("/(main)/Home");
    } catch (err: any) {
      console.error("Skip error:", err);
      Alert.alert("Unexpected Error", err.message || "Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-white to-pink-50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
            <Text className="text-pink-500 font-semibold">← Back</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">Step 3 of 3</Text>

          <SkipButton to="/(main)/Home" onSkip={handleSkip} />
        </View>
        {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-10 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-full" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2">What are your interests?</Text>
        <Text className="text-gray-600 text-base mb-6">
          Pick at least 3 to help us find your perfect match — we’ll use this to find better matches.
        </Text>

        {/* Search bar */}
        <View className="mb-6 flex-row items-center bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm">
          <Text className="text-lg mr-2">🔍</Text>
          <TextInput
            placeholder="Search interests..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-800"
          />
        </View>

        {/* Selection counter */}
        <View className="mb-6 p-3 bg-pink-50 rounded-lg border border-pink-200">
          <Text className="text-center text-pink-600 font-semibold">
            {selected.length} selected {selected.length < 3 ? `(${3 - selected.length} more needed)` : ""}
          </Text>
        </View>

        {/* Interest chips */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {filteredInterests.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggleInterest(interest)}
                activeOpacity={0.8}
                className={`px-4 py-3 rounded-full border-2 transition-all duration-200 ${
                  isSelected
                    ? "bg-pink-500 border-pink-500 shadow-md"
                    : "border-gray-300 bg-white shadow-sm"
                }`}
              >
                <Text
                  className={`font-semibold text-[14px] ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {isSelected ? "✓ " : ""}{interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Finish Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selected.length < 3}
          activeOpacity={0.85}
          className="mt-4"
        >
          <LinearGradient
            colors={selected.length >= 3 ? ["#ff69b4", "#ff1493"] : ["#d1d5db", "#9ca3af"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4 rounded-2xl shadow-lg"
          >
            <Text className="text-white text-center font-bold text-lg">
              {selected.length >= 3 ? "Let's Find Your Match!" : `Select ${3 - selected.length} more`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
