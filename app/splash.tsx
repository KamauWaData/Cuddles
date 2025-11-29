// app/splash.tsx
import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      if (hasSeenOnboarding) {
        router.replace("/(auth)/login"); // Skip to auth
      } else {
        router.replace("/SplashScreen"); // Show walkthrough
      }
    }, 2500); // 2.5s delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-pink-100 justify-center items-center">
      <Image
        source={require("../assets/cuddles.png")}
        className="w-32 h-32 mb-6"
        resizeMode="contain"
      />
      <Text className="text-3xl font-bold text-pink-700 mb-2">Cuddles</Text>
      <Text className="text-gray-600 text-center px-10">
        Where connections begin 💖
      </Text>
    </View>
  );
}
