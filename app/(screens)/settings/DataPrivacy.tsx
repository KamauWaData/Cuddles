import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DataPrivacy() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data Privacy & GDPR</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

            <Section
              title="GDPR Compliance"
              content={`We are committed to compliance with the General Data Protection Regulation (GDPR) and other data protection laws. This page explains your rights and our obligations.`}
            />

            <Section
              title="Your Rights Under GDPR"
              content={`As a user, you have the following rights:

• Right to Access: Request a copy of all personal data we hold
• Right to Rectification: Correct inaccurate information
• Right to Erasure: Request deletion of your data ("Right to be forgotten")
• Right to Restrict Processing: Limit how we use your data
• Right to Data Portability: Receive your data in machine-readable format
• Right to Object: Oppose certain processing activities
• Right to Lodge Complaints: Contact your local data protection authority`}
            />

            <Section
              title="Data Collection Basis"
              content={`We collect and process your data based on:

• Consent: You actively agree to data processing
• Contract: Processing is necessary for our service
• Legal Obligation: We must comply with laws
• Vital Interests: To protect health and safety
• Legitimate Interests: Our business operations`}
            />

            <Section
              title="Lawful Basis for Processing"
              content={`Profile Information: Based on contract and consent
Location Data: Based on consent and legitimate interests
Communication Data: Based on contract and consent
Analytics: Based on legitimate interests
Marketing: Based on consent`}
            />

            <Section
              title="International Data Transfers"
              content={`If you are in the EU/EEA, note that your data may be transferred to servers outside these regions. We ensure adequate protections through Standard Contractual Clauses and other mechanisms.`}
            />

            <Section
              title="Data Retention"
              content={`We retain data as follows:

• Active Account: Throughout your account existence
• After Deletion: 30 days for recovery, then deleted
• Legal/Safety: Retained as required by law
• Backups: Kept for up to 90 days
• Anonymized Data: Retained indefinitely`}
            />

            <Section
              title="Data Protection Officer (DPO)"
              content={`We have appointed a Data Protection Officer. For GDPR-related inquiries, contact:
Email: dpo@cuddles.app
Phone: +1-XXX-XXX-XXXX (availability during business hours)`}
            />

            <Section
              title="Cookie Policy"
              content={`We use cookies and similar technologies for:
• Essential functions
• Performance and analytics
• User preferences
• Security and fraud prevention

You can control cookies through your device settings.`}
            />

            <Section
              title="Exercising Your Rights"
              content={`To exercise your GDPR rights:

1. Send a request to: privacy@cuddles.app
2. Include proof of identity
3. Specify which right you're exercising
4. We will respond within 30 days

For access requests, we provide data in CSV format.`}
            />

            <Section
              title="Complaints"
              content={`If you believe we've violated your rights, you can:

1. Contact us first at privacy@cuddles.app
2. File a complaint with your local data protection authority
3. In the EU: https://edpb.ec.europa.eu/about-edpb/board/members_en`}
            />

            <Section
              title="Changes to This Policy"
              content={`We may update this policy to reflect changes in regulations or our practices. We will notify you of material changes.`}
            />

            <Section
              title="Contact Information"
              content={`For data privacy inquiries:
Email: privacy@cuddles.app
Support: support@cuddles.app
Address: Check our website for office address`}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  lastUpdated: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
});
