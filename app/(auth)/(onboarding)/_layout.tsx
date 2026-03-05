import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false,}}>
      <Stack.Screen name="ProfileName" />
      <Stack.Screen name="Gender" />
      <Stack.Screen name="Lifestyle" />
      <Stack.Screen name="Interests" />
    </Stack>
  );
}
