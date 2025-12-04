import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function About() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>About Cuddles</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 12 }}>
        Cuddles is a dating app designed for safety, privacy, and genuine connections.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • 18+ Only. You must be at least 18 years old to use this app.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • We are committed to user safety and data privacy.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • For support or questions, contact us via the app or website.
      </Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 24, textAlign: "center" }}>
        Cuddles © {new Date().getFullYear()}
      </Text>
    </ScrollView>
  );
}
