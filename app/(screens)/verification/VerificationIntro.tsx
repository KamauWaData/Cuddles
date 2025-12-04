import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function VerificationIntro() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Verify Your Profile</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 32 }}>
        Verification helps keep our community safe. Please complete a quick verification step to unlock all features.
      </Text>
      <Button title="Start Verification" onPress={() => router.push("/(screens)/verification/VerifyPhoto")} />
    </View>
  );
}
