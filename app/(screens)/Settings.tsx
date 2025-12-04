import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

interface SettingsSection {
  title: string;
  icon: string;
  description: string;
  route?: string;
  action?: () => void;
  destructive?: boolean;
}

export default function Settings() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(auth)/Login");
        },
      },
    ]);
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Account Settings",
      icon: "settings-outline",
      description: "Manage your account preferences",
    },
    {
      title: "Edit Profile",
      icon: "create-outline",
      description: "Update your profile information",
      route: "/(screens)/profile/EditProfile",
    },
    {
      title: "Set Location",
      icon: "location-outline",
      description: "Update your location for better matches",
      route: "/(screens)/SetLocation",
    },
  ];

  const legalSections: SettingsSection[] = [
    {
      title: "Privacy Policy",
      icon: "document-outline",
      description: "Read our privacy policy",
      route: "/(screens)/settings/PrivacyPolicy",
    },
    {
      title: "Data Privacy & GDPR",
      icon: "shield-checkmark-outline",
      description: "Understand how we handle your data",
      route: "/(screens)/settings/DataPrivacy",
    },
    {
      title: "Safety Tips",
      icon: "warning-outline",
      description: "Learn how to stay safe while dating",
      route: "/(screens)/settings/SafetyTips",
    },
  ];

  const dangerSections: SettingsSection[] = [
    {
      title: "Delete Account",
      icon: "trash-outline",
      description: "Permanently delete your account",
      route: "/(screens)/settings/DeleteAccount",
      destructive: true,
    },
    {
      title: "Sign Out",
      icon: "log-out-outline",
      description: "Sign out from your account",
      action: handleLogout,
      destructive: true,
    },
  ];

  const SettingItem = ({ item }: { item: SettingsSection }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => {
        if (item.route) {
          router.push(item.route as any);
        } else if (item.action) {
          item.action();
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemContent}>
        <View style={[styles.settingIcon, item.destructive && styles.settingIconDanger]}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.destructive ? "#EF4444" : "#FF3366"}
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, item.destructive && styles.settingTitleDanger]}>
            {item.title}
          </Text>
          <Text style={styles.settingDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={item.destructive ? "#EF4444" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* About App Section */}
          <View style={styles.aboutSection}>
            <View style={styles.aboutIconContainer}>
              <Text style={styles.aboutIcon}>💕</Text>
            </View>
            <Text style={styles.appName}>cuddles</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <View style={styles.ageRestrictionBanner}>
              <Ionicons name="information-circle" size={20} color="#DC2626" />
              <View style={styles.ageRestrictionText}>
                <Text style={styles.ageRestrictionTitle}>18+ Only</Text>
                <Text style={styles.ageRestrictionSubtext}>
                  This app is strictly for users 18 years and older.
                </Text>
              </View>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            <View style={styles.sectionContent}>
              {settingsSections.map((item, index) => (
                <View key={index}>
                  <SettingItem item={item} />
                  {index < settingsSections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Legal & Safety */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>LEGAL & SAFETY</Text>
            <View style={styles.sectionContent}>
              {legalSections.map((item, index) => (
                <View key={index}>
                  <SettingItem item={item} />
                  {index < legalSections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>
            <View style={styles.sectionContent}>
              {dangerSections.map((item, index) => (
                <View key={index}>
                  <SettingItem item={item} />
                  {index < dangerSections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Need help? Contact us at{" "}
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL("mailto:support@cuddles.app")}
              >
                support@cuddles.app
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  aboutSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  aboutIconContainer: {
    marginBottom: 8,
  },
  aboutIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF3366",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  ageRestrictionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginTop: 8,
  },
  ageRestrictionText: {
    flex: 1,
  },
  ageRestrictionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 2,
  },
  ageRestrictionSubtext: {
    fontSize: 12,
    color: "#991B1B",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  settingIconDanger: {
    backgroundColor: "#FEF2F2",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingTitleDanger: {
    color: "#DC2626",
  },
  settingDescription: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  footerInfo: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  footerLink: {
    color: "#FF3366",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
