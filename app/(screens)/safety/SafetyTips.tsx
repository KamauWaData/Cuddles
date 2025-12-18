import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function SafetyTips() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Safety Tips</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 12 }}>
        Your safety is our priority. Here are some tips to help you stay safe while using Cuddles:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>2 Never share personal information too soon.</Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>2 Meet in public places for first dates.</Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>2 Trust your instincts and report suspicious behavior.</Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>2 Use the block and report features if needed.</Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 24, textAlign: "center" }}>
        Stay safe and have fun!
      </Text>
    </ScrollView>
  );
}
