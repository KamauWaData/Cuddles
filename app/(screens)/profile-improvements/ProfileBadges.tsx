import React from "react";
import { View, Text } from "react-native";

export default function ProfileBadges() {
  return (
    <View style={{ padding: 24, backgroundColor: "#fff", flex: 1, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" }}>Profile Badges</Text>
      <Text style={{ fontSize: 16, color: "#555", textAlign: "center", marginBottom: 24 }}>
        Earn badges for completing verification, adding interests, and more. Badges help you stand out!
      </Text>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>🏅</Text>
        <Text style={{ fontSize: 16, color: "#888" }}>Coming soon: Your badge collection!</Text>
      </View>
    </View>
  );
}
