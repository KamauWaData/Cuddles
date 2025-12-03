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
      className="flex-1 p-6 justify-between"
    >
      <View>
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
            <Text className="text-pink-500 font-semibold">← Back</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">Step 2 of 3</Text>

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
        <View className="w-full h-1 bg-gray-200 mb-10 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-2/3" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Profile</Text>
        <Text className="text-gray-600 text-base mb-10">Help us find your perfect match</Text>

        {/* Gender Selection */}
        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-4">I am a</Text>
          <View className="flex-row gap-3 justify-between">
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setGender(option)}
                className={`flex-1 py-4 rounded-2xl border-2 shadow-sm items-center justify-center transition-all ${
                  gender === option
                    ? "bg-pink-500 border-pink-500"
                    : "bg-white border-gray-200"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-base font-bold ${
                    gender === option ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option === "Man" ? "👨" : "👩"} {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Show Me Selection */}
        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Show me</Text>
          <View className="flex-row gap-3 justify-between">
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={`show-${option}`}
                onPress={() => toggleShowMe(option)}
                className={`flex-1 py-4 rounded-2xl border-2 shadow-sm items-center justify-center transition-all ${
                  showMe.includes(option)
                    ? "bg-pink-500 border-pink-500"
                    : "bg-white border-gray-200"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-base font-bold ${
                    showMe.includes(option) ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option === "Man" ? "👨" : "👩"}
                </Text>
                <Text className={`text-xs font-semibold mt-1 ${
                    showMe.includes(option) ? "text-white" : "text-gray-600"
                  }`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
        <LinearGradient
          colors={["#ff69b4", "#ff1493"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 rounded-2xl shadow-lg"
        >
          <Text className="text-center text-white font-bold text-lg">Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}
