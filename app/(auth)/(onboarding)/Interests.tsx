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
      const userProfile = {
        ...parsedProfile,
        interests: selected,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles") // ✅ use consistent table
        .upsert({ id: uid, ...userProfile });

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

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-8 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-4/5" />
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
    </View>
  );
}
