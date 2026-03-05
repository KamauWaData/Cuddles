import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import SkipButton from "../../../components/onboarding/SkipButton";
import { UserAttributes } from "../../../lib/advancedFilters";

const smokingOptions = [
  { label: "Never", value: "never" },
  { label: "Sometimes", value: "sometimes" },
  { label: "Regularly", value: "regularly" },
];

const drinkingOptions = [
  { label: "Never", value: "never" },
  { label: "Sometimes", value: "sometimes" },
  { label: "Regularly", value: "regularly" },
];

const educationOptions = [
  { label: "High School", value: "high_school" },
  { label: "Bachelors", value: "bachelors" },
  { label: "Masters", value: "masters" },
  { label: "PhD", value: "phd" },
];

const religionOptions = [
  { label: "Christian", value: "christian" },
  { label: "Muslim", value: "muslim" },
  { label: "Jewish", value: "jewish" },
  { label: "Hindu", value: "hindu" },
  { label: "Buddhist", value: "buddhist" },
  { label: "Atheist", value: "atheist" },
  { label: "Other", value: "not_specified" },
];

const relationshipOptions = [
  { label: "Casual", value: "casual" },
  { label: "Serious", value: "serious" },
  { label: "Not Sure", value: "not_specified" },
];

export default function Lifestyle() {
  const { uid, profile } = useLocalSearchParams();
  const parsedProfile =
    typeof profile === "string" ? JSON.parse(profile) : profile;

  // --------------------------
  // STATE
  // --------------------------
  const [height, setHeight] = useState(170);
  const [smoking, setSmoking] = useState<UserAttributes["smoking"]>("not_specified");
  const [drinking, setDrinking] = useState<UserAttributes["drinking"]>("not_specified");
  const [education, setEducation] = useState<UserAttributes["education"]>("not_specified");
  const [religion, setReligion] = useState<UserAttributes["religion"]>("not_specified");
  const [relationshipType, setRelationshipType] = useState<UserAttributes["relationship_type"]>("not_specified");

  const handleContinue = () => {
    // We allow "not_specified" but it's better if they pick at least a few
    router.push({
      pathname: "/(auth)/(onboarding)/Interests",
      params: {
        uid,
        profile: JSON.stringify({
          ...parsedProfile,
          height_cm: height,
          smoking,
          drinking,
          education,
          religion,
          relationship_type: relationshipType,
        }),
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-[#fff0f5]">
      <LinearGradient
        colors={["#fff0f5", "#ffe4e1"]}
        className="flex-1 p-6 pb-12"
      >
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
            <Text className="text-pink-500 font-semibold">← Back</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">Step 3 of 4</Text>

          <SkipButton
            to="/(auth)/(onboarding)/Interests"
            onSkip={async () => {
              // No need to upsert here, Interests will handle final save
            }}
          />
        </View>

        {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-10 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-3/4" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2">Lifestyle & Traits</Text>
        <Text className="text-gray-600 text-base mb-8">This helps us find more compatible matches for you.</Text>

        {/* Height Slider */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800">Height</Text>
            <Text className="text-pink-600 font-bold text-xl">{height} cm</Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={140}
            maximumValue={220}
            step={1}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor="#FF69B4"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#FF1493"
          />
        </View>

        {/* Smoking */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Smoking</Text>
          <View className="flex-row gap-2 flex-wrap">
            {smokingOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSmoking(opt.value as any)}
                className={`px-4 py-3 rounded-2xl border-2 ${
                  smoking === opt.value
                    ? "bg-pink-500 border-pink-500 shadow-md"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    smoking === opt.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Drinking */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Drinking</Text>
          <View className="flex-row gap-2 flex-wrap">
            {drinkingOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDrinking(opt.value as any)}
                className={`px-4 py-3 rounded-2xl border-2 ${
                  drinking === opt.value
                    ? "bg-pink-500 border-pink-500 shadow-md"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    drinking === opt.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Education */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Education</Text>
          <View className="flex-row gap-2 flex-wrap">
            {educationOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setEducation(opt.value as any)}
                className={`px-4 py-3 rounded-2xl border-2 ${
                  education === opt.value
                    ? "bg-pink-500 border-pink-500 shadow-md"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    education === opt.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Religion */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Religion</Text>
          <View className="flex-row gap-2 flex-wrap">
            {religionOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setReligion(opt.value as any)}
                className={`px-3 py-2 rounded-xl border ${
                  religion === opt.value
                    ? "bg-pink-500 border-pink-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    religion === opt.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Relationship Type */}
        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Looking for</Text>
          <View className="flex-row gap-2 flex-wrap">
            {relationshipOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setRelationshipType(opt.value as any)}
                className={`flex-1 py-4 rounded-2xl border-2 items-center justify-center ${
                  relationshipType === opt.value
                    ? "bg-pink-500 border-pink-500 shadow-md"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <Text
                  className={`font-bold ${
                    relationshipType === opt.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
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
    </ScrollView>
  );
}
