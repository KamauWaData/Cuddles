import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function PrivacyPolicy() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Privacy Policy</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 12 }}>
        We value your privacy. This page explains how we collect, use, and protect your data on Cuddles.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • We only collect information necessary to provide our services.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • Your data is never sold to third parties.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • You can request deletion of your data at any time.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        • For full details, please review our Terms of Service and contact support for any questions.
      </Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 24, textAlign: "center" }}>
        Your privacy matters to us.
      </Text>
    </ScrollView>
  );
}
