import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";

type Props = {
  message?: string;
};

export default function BrandedLoading({ message }: Props) {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Optional logo image (replace with your own asset if available) */}
      {/* <Image
        source={require("../assets/logo.png")}
        className="w-20 h-20 mb-4"
        resizeMode="contain"
      /> */}

      {/* Brand wordmark */}
      <Text className="text-4xl font-extrabold text-pink-600">cuddles</Text>
      {message && (
        <Text className="text-gray-500 mt-2">{message}</Text>
      )}

      {/* Optional subtle loader */}
      <ActivityIndicator size="small" color="#ec4899" className="mt-4" />
    </View>
  );
}
