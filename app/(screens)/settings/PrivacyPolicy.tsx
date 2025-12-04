import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
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
              title="1. Information We Collect"
              content={`We collect information you provide directly, such as:
• Profile information (name, age, location, interests)
• Photos and profile images
• Bio/about information
• Conversation messages
• Device information (location, device ID)
• Usage data and analytics`}
            />

            <Section
              title="2. How We Use Your Information"
              content={`We use the information for:
• Creating and maintaining your account
• Providing dating services and matching
• Improving our app and services
• Preventing fraud and abuse
• Sending notifications and updates
• Responding to your inquiries
• Legal compliance`}
            />

            <Section
              title="3. Information Sharing"
              content={`We do NOT sell your personal information. We may share information:
• With service providers who assist us
• To comply with legal obligations
• To protect our rights and safety
• In case of business transactions
• With your consent`}
            />

            <Section
              title="4. Data Security"
              content={`We implement security measures to protect your information:
• Encryption of sensitive data
• Secure authentication
• Regular security assessments
• Limited access to personal information

However, no method of transmission is 100% secure.`}
            />

            <Section
              title="5. Data Retention"
              content={`We retain your information while your account is active. After account deletion, we retain some information for legal compliance and may keep anonymized data for analytics.`}
            />

            <Section
              title="6. Your Rights"
              content={`You have the right to:
• Access your personal data
• Correct inaccurate information
• Delete your account and data
• Port your data to another service
• Opt-out of certain communications

Contact us to exercise these rights.`}
            />

            <Section
              title="7. Third-Party Links"
              content={`Our app may contain links to third-party services. We are not responsible for their privacy practices. Review their privacy policies before sharing information.`}
            />

            <Section
              title="8. Children's Privacy"
              content={`This app is strictly for users 18 years and older. We do not knowingly collect information from minors. If we discover a user is underage, we will delete their account.`}
            />

            <Section
              title="9. Changes to This Policy"
              content={`We may update this policy from time to time. We will notify you of significant changes via email or through the app.`}
            />

            <Section
              title="10. Contact Us"
              content={`For privacy concerns, contact us at:
Email: privacy@cuddles.app
Support: support@cuddles.app`}
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
