// app/_layout.tsx
import './global.css';
import { Stack, Slot, Redirect } from "expo-router";
import { useSession } from "../lib/useSession";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { session, loading } = useSession();

  // Show splash while loading auth state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  // Redirect logic
  if (!session) {
    return <Redirect href="/(auth)/splash" />;
  }

  // Optional: check onboarding completion
  const onboarded = session?.user?.user_metadata?.onboarded;
  if (!onboarded) {
    return <Redirect href="/(onboarding)" />;
  }

  // If logged in and onboarded → show main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)" />
    </Stack>
  );
}






