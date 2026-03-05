import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../lib/pushNotifications";

interface NotificationSettings {
  new_likes: boolean;
  new_matches: boolean;
  messages: boolean;
  super_likes: boolean;
  rewinds: boolean;
}

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getNotificationSettings();
      if (userSettings) {
        setSettings({
          new_likes: userSettings.new_likes ?? true,
          new_matches: userSettings.new_matches ?? true,
          messages: userSettings.messages ?? true,
          super_likes: userSettings.super_likes ?? true,
          rewinds: userSettings.rewinds ?? true,
        });
      }
    } catch (error) {
      console.error("Load notification settings error:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key: keyof NotificationSettings) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);

    try {
      setSaving(true);
      const success = await updateNotificationSettings({
        [key]: newSettings[key],
      });

      if (!success) {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Update notification settings error:", error);
      Alert.alert("Error", "Failed to save setting");
      // Revert change
      setSettings({
        ...newSettings,
        [key]: !newSettings[key],
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro */}
          <View style={styles.introContainer}>
            <View style={styles.introIcon}>
              <Ionicons name="notifications" size={40} color="#FF3366" />
            </View>
            <Text style={styles.introTitle}>Notification Preferences</Text>
            <Text style={styles.introSubtitle}>
              Choose which notifications you'd like to receive
            </Text>
          </View>

          {/* Notification Types */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVITY NOTIFICATIONS</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="heart"
                title="New Likes"
                description="When someone likes your profile"
                value={settings?.new_likes ?? true}
                onToggle={() => handleToggleSetting("new_likes")}
                disabled={saving}
                color="#EF4444"
              />

              <SettingItem
                icon="flame"
                title="New Matches"
                description="When you match with someone"
                value={settings?.new_matches ?? true}
                onToggle={() => handleToggleSetting("new_matches")}
                disabled={saving}
                color="#FF3366"
              />

              <SettingItem
                icon="star"
                title="Super Likes"
                description="When someone super likes you"
                value={settings?.super_likes ?? true}
                onToggle={() => handleToggleSetting("super_likes")}
                disabled={saving}
                color="#F59E0B"
              />
            </View>
          </View>

          {/* Chat & Messages */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MESSAGES</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="chatbubble"
                title="Messages"
                description="When you receive a new message"
                value={settings?.messages ?? true}
                onToggle={() => handleToggleSetting("messages")}
                disabled={saving}
                color="#3B82F6"
              />
            </View>
          </View>

          {/* Undo Features */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>UNDO FEATURES</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="arrow-undo"
                title="Rewind Notifications"
                description="When you rewind a profile"
                value={settings?.rewinds ?? true}
                onToggle={() => handleToggleSetting("rewinds")}
                disabled={saving}
                color="#8B5CF6"
              />
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              You'll always receive critical notifications (account security, terms of service changes) regardless of these settings.
            </Text>
          </View>

          {/* Reset to Defaults */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                Alert.alert("Reset to Defaults?", "This will enable all notifications.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      const defaultSettings = {
                        new_likes: true,
                        new_matches: true,
                        messages: true,
                        super_likes: true,
                        rewinds: true,
                      };
                      setSettings(defaultSettings);
                      await updateNotificationSettings(defaultSettings);
                      Alert.alert("Reset", "Notifications reset to defaults");
                    },
                  },
                ]);
              }}
              disabled={saving}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#D1D5DB", true: "#FFB6C1" }}
        thumbColor={value ? "#FF3366" : "#F3F4F6"}
      />
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
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
  introContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  introIcon: {
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  introSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  settingsGroup: {
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  infoBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
  },
});
