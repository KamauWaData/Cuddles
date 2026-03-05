import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SafetyTip {
  icon: string;
  title: string;
  tips: string[];
}

export default function SafetyTips() {
  const router = useRouter();

  const safetyTips: SafetyTip[] = [
    {
      icon: "person-outline",
      title: "Profile Safety",
      tips: [
        "Use a recent, clear photo that actually looks like you",
        "Don't share your last name, address, or workplace upfront",
        "Be honest in your profile about your interests and intentions",
        "Avoid sharing explicit photos with strangers",
        "Never post your phone number or email in your profile",
      ],
    },
    {
      icon: "shield-checkmark-outline",
      title: "Communication",
      tips: [
        "Meet people only through the app's messaging system initially",
        "Don't share personal contact info until you trust them",
        "Be cautious of people who avoid video calls or photo verification",
        "Report suspicious messages or harassment immediately",
        "Trust your instincts - if something feels off, it probably is",
      ],
    },
    {
      icon: "location-outline",
      title: "Meeting in Person",
      tips: [
        "Always meet in public places for the first date",
        "Tell a trusted friend where you're going and when you'll be back",
        "Share your location with friends during the date",
        "Use your own transportation",
        "Plan your own way home - don't rely on the other person",
        "Set a time limit for your first meeting",
      ],
    },
    {
      icon: "alert-circle-outline",
      title: "Red Flags to Watch",
      tips: [
        "Asking for money or financial information",
        "Refusing to video call or meet in person",
        "Pressuring you for explicit photos",
        "Being vague about their life, work, or intentions",
        "Moving conversations off the app too quickly",
        "Love bombing or extreme flattery early on",
        "Inconsistent stories or lies",
      ],
    },
    {
      icon: "heart-outline",
      title: "Emotional Safety",
      tips: [
        "Take breaks if online dating feels overwhelming",
        "Don't get invested before meeting in person",
        "Be prepared for rejection - it's normal",
        "Don't share sensitive personal information too early",
        "Trust your gut about compatibility",
        "Keep your own identity and interests active",
      ],
    },
    {
      icon: "phone-outline",
      title: "Digital Safety",
      tips: [
        "Use a strong, unique password for your account",
        "Enable two-factor authentication if available",
        "Be cautious of phishing links or requests for payment",
        "Don't share sensitive documents or IDs",
        "Keep your app updated to the latest version",
        "Report account hacking or suspicious activity immediately",
      ],
    },
  ];

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety Tips</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <Ionicons name="shield" size={40} color="#FF3366" />
            </View>
            <Text style={styles.introTitle}>Stay Safe While Dating Online</Text>
            <Text style={styles.introText}>
              Your safety is our top priority. Follow these tips for a safer dating experience.
            </Text>
          </View>

          {/* Safety Tips */}
          {safetyTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name={tip.icon as any} size={20} color="#FF3366" />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>

              <View style={styles.tipsList}>
                {tip.tips.map((item, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <View style={styles.tipBullet}>
                      <Text style={styles.tipBulletText}>•</Text>
                    </View>
                    <Text style={styles.tipItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Emergency Info */}
          <View style={styles.emergencySection}>
            <View style={styles.emergencyHeader}>
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text style={styles.emergencyTitle}>Emergency Resources</Text>
            </View>

            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>National Dating Violence Hotline (US)</Text>
              <Text style={styles.resourceValue}>1-866-331-9474</Text>
            </View>

            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>RAINN Sexual Assault Hotline (US)</Text>
              <Text style={styles.resourceValue}>1-800-656-4673</Text>
            </View>

            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>International Sexual Assault Resources</Text>
              <Text style={styles.resourceValue}>
                Visit https://www.rainn.org/international for local hotlines
              </Text>
            </View>
          </View>

          {/* Reporting Abuse */}
          <View style={styles.reportingSection}>
            <Text style={styles.reportingTitle}>Report Abuse on Our App</Text>
            <Text style={styles.reportingText}>
              If someone harasses, threatens, or scams you:
            </Text>
            <View style={styles.reportingSteps}>
              <Step number="1" text="Use the report button on their profile" />
              <Step number="2" text="Screenshot evidence of problematic behavior" />
              <Step number="3" text="Block the user immediately" />
              <Step number="4" text="Contact support: support@cuddles.app" />
            </View>
          </View>

          {/* 18+ Reminder */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.reminderTitle}>Age Verification</Text>
            <Text style={styles.reminderText}>
              This platform is strictly for users 18 years and older. If you encounter underage
              users, please report them immediately.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
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
  intro: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: "#FFF0F5",
    borderRadius: 14,
    marginHorizontal: 16,
  },
  introIcon: {
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  introText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  tipCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: "row",
    gap: 10,
  },
  tipBullet: {
    width: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tipBulletText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3366",
  },
  tipItemText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  emergencySection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
  resourceItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FEE2E2",
  },
  resourceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
  reportingSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reportingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  reportingText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  reportingSteps: {
    gap: 10,
  },
  step: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FF3366",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF3366",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    paddingTop: 6,
  },
  reminderSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    alignItems: "center",
  },
  reminderIcon: {
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 20,
  },
});
