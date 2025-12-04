import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function DataPrivacyGDPR() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Data Privacy & GDPR</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 12 }}>
        Cuddles is committed to protecting your data and complying with GDPR and other privacy regulations.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • You have the right to access, correct, or delete your personal data.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • We process your data lawfully, transparently, and for legitimate purposes only.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • You can withdraw consent or request data export at any time.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • For requests, contact support via the app or email.
      </Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 24, textAlign: "center" }}>
        Your rights are respected and protected.
      </Text>
    </ScrollView>
  );
}
