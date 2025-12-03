import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../lib/supabase";
import SkipButton from "../../../components/onboarding/SkipButton";

const genderOptions = ["Man", "Woman"];

export default function Gender() {
  const { uid, profile } = useLocalSearchParams();
  const parsedProfile =
    typeof profile === "string" ? JSON.parse(profile) : profile;

  const [gender, setGender] = useState("");
  const [showMe, setShowMe] = useState<string[]>([]);

  const toggleShowMe = (option: string) => {
    setShowMe((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleContinue = () => {
    if (!gender || showMe.length === 0) {
      Alert.alert("Missing Info", "Please select your gender and who to show you.");
      return;
    }

    router.push({
      pathname: "/(auth)/(onboarding)/Interests",
      params: {
        uid,
        profile: JSON.stringify({
          ...parsedProfile,
          gender,
          showMe,
        }),
      },
    });
  };

  return (
    <LinearGradient
      colors={["#fff0f5", "#ffe4e1"]}
      className="flex-1 p-6 justify-center"
    >
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
          <Text className="text-pink-500">Back</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold">Your Profile Name</Text>
        
        <SkipButton
          to="/(auth)/(onboarding)/Interests"
          onSkip={async () => {
            await supabase.from("users").upsert({
              id: uid,
              name: null,
              profile_complete: false,
              updatedAt: new Date().toISOString(),
            });
          }}
        />
      </View>
      {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-8 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-3/5" />
        </View>

      <View className="items-center mb-10">
        <Text className="text-3xl font-extrabold text-pink-600 mb-2">
          Let's Personalize You
        </Text>
        <Text className="text-gray-600 text-center">
          Select your gender and who you want to see
        </Text>
      </View>

      {/* Gender Selection */}
      <Text className="text-lg font-semibold text-gray-700 mb-3">I am a</Text>
      <View className="flex-row justify-around mb-8">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setGender(option)}
            className={`px-8 py-4 rounded-2xl shadow-sm border ${
              gender === option
                ? "bg-pink-500 border-pink-500"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                gender === option ? "text-white" : "text-gray-700"
              }`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show Me Selection */}
      <Text className="text-lg font-semibold text-gray-700 mb-3">
        Show me
      </Text>
      <View className="flex-row justify-around mb-10">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => toggleShowMe(option)}
            className={`px-8 py-4 rounded-2xl shadow-sm border ${
              showMe.includes(option)
                ? "bg-pink-500 border-pink-500"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                showMe.includes(option) ? "text-white" : "text-gray-700"
              }`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity onPress={handleContinue} activeOpacity={0.9}>
        <LinearGradient
          colors={["#ff69b4", "#ff1493"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 rounded-2xl shadow-md"
        >
          <Text className="text-center text-white font-bold text-lg">
            Continue
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}
