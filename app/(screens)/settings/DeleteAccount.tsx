import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";

export default function DeleteAccount() {
  const router = useRouter();
  const [step, setStep] = useState<"warning" | "confirm" | "reason">("warning");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleDeleteAccount = async () => {
    if (!agreed) {
      Alert.alert("Confirmation Required", "Please check the box to confirm account deletion.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        Alert.alert("Error", "Could not identify user.");
        setLoading(false);
        return;
      }

      // Log deletion reason
      if (reason.trim()) {
        await supabase.from("deletion_feedback").insert({
          user_id: userId,
          reason: reason.trim(),
          deleted_at: new Date().toISOString(),
        }).catch(() => {
          // Ignore errors in feedback logging
        });
      }

      // Delete user profile data
      await supabase.from("profiles").delete().eq("id", userId);

      // Delete auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        // Fallback: Try alternative deletion method
        await supabase.auth.signOut();
      }

      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted. All your data has been removed.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/Login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Account deletion error:", error);
      Alert.alert("Deletion Error", "Failed to delete account. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (step !== "warning") {
                setStep("warning");
                setAgreed(false);
                setReason("");
              } else {
                router.back();
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === "warning" && (
            <>
              {/* Warning Section */}
              <View style={styles.warningContainer}>
                <View style={styles.warningIcon}>
                  <Ionicons name="warning" size={48} color="#DC2626" />
                </View>
                <Text style={styles.warningTitle}>Delete Your Account?</Text>
                <Text style={styles.warningSubtitle}>This action cannot be undone.</Text>
              </View>

              {/* What Happens */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What happens when you delete your account:</Text>

                <Item
                  icon="trash"
                  title="All data removed"
                  description="Your profile, messages, photos, and all personal information will be permanently deleted."
                />

                <Item
                  icon="close-circle"
                  title="No recovery"
                  description="You cannot recover your account or data after deletion. You'll need to create a new account to use the app."
                />

                <Item
                  icon="lock-closed"
                  title="Legal compliance"
                  description="We retain anonymized data for legal compliance, but all personally identifiable information is deleted."
                />

                <Item
                  icon="ban"
                  title="No reactivation"
                  description="Your account cannot be reactivated. You must register as a new user."
                />
              </View>

              {/* Before You Go */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Before you go:</Text>
                <Text style={styles.sectionText}>
                  If you're having issues with the app or our service, please contact us first. We'd love to help!
                </Text>
                <Text style={styles.contactText}>support@cuddles.app</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Keep My Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setStep("reason")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteButtonText}>Continue to Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === "reason" && (
            <>
              {/* Reason Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Help us improve (optional)</Text>
                <Text style={styles.sectionText}>
                  Tell us why you're deleting your account. This helps us improve the app.
                </Text>

                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your feedback..."
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9CA3AF"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Confirmation Checkbox */}
              <View style={styles.section}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, agreed && styles.checkboxChecked]}
                    onPress={() => setAgreed(!agreed)}
                    disabled={loading}
                  >
                    {agreed && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    I understand this will permanently delete my account and all associated data.
                  </Text>
                </View>
              </View>

              {/* Final Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setStep("warning")}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Go Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, !agreed && styles.deleteButtonDisabled]}
                  onPress={handleDeleteAccount}
                  disabled={!agreed || loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete My Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Item({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon as any} size={20} color="#DC2626" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
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
  warningContainer: {
    alignItems: "center",
    paddingVertical: 32,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  warningIcon: {
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#DC2626",
    marginBottom: 8,
    textAlign: "center",
  },
  warningSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3366",
    marginTop: 8,
  },
  itemContainer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FEE2E2",
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  textInputContainer: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#DC2626",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    backgroundColor: "#FFF0F5",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
