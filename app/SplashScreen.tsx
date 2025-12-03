// app/onboarding.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Onboarding() {
  const router = useRouter();

  const handleStart = async (path: string) => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.push(path);
  };

  return (
    <View className="flex-1 justify-between items-center bg-pink-500 px-6 py-10">
      {/* Top Images */}
      <View className="w-full items-center mt-10 mb-20">
        <Image source={require('../assets/cuddles.png')} />
      </View>

      {/* Welcome Text */}
      <View className="items-center mt-6">
        <Text className="text-white text-3xl font-bold">Welcome to Cuddles</Text>
        <Text className="text-white text-sm mt-2">Meet your better half in minutes!</Text>
      </View>

      {/* Buttons */}
      <View className="w-full mt-10">
        <TouchableOpacity
          onPress={() => handleStart("/(auth)/register")}
          className="bg-white py-3 rounded-full flex-row items-center justify-center"
        >
          <Text className="text-pink-500 text-base font-semibold">→ Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleStart("/(auth)/login")}
          className="mt-4 items-center"
        >
          <Text className="text-white text-sm">
            Already have an account? <Text className="underline">Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
