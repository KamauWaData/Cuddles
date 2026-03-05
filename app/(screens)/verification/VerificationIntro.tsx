import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getVerificationStatus, getVerificationBadge } from "../../../lib/verification";

export default function VerificationIntro() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const status = await getVerificationStatus("selfie");
      setVerificationStatus(status);
    } catch (error) {
      console.error("Load verification status error:", error);
    } finally {
      setLoading(false);
    }
  };

  const badge = getVerificationBadge(verificationStatus);

  const handleStartVerification = () => {
    if (verificationStatus?.status === "verified") {
      Alert.alert("Already Verified", "Your profile is already verified!");
      return;
    }

    router.push("/(screens)/verification/VerifyPhoto");
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <SafeAreaView style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
          <Text style={styles.loadingText}>Checking verification status...</Text>
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
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <Ionicons name="shield-checkmark" size={64} color="#FF3366" />
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>Verify Your Profile</Text>
          <Text style={styles.subtitle}>
            Verification builds trust in our community. Get a verified badge to stand out and increase your matches!
          </Text>

          {/* Current Status */}
          {badge.show && (
            <View style={styles.statusCard}>
              <View
                style={[
                  styles.statusIconContainer,
                  { backgroundColor: badge.color + "20" },
                ]}
              >
                <Ionicons name={badge.icon as any} size={32} color={badge.color} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: badge.color }]}>
                  {badge.label}
                </Text>
                <Text style={styles.statusMessage}>
                  {verificationStatus?.status === "verified" &&
                    "Your profile is verified and trusted!"}
                  {verificationStatus?.status === "pending" &&
                    "Your verification is being reviewed."}
                  {verificationStatus?.status === "rejected" &&
                    "Please try again with a different photo."}
                </Text>
              </View>
            </View>
          )}

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why Verify?</Text>

            <BenefitItem
              icon="star"
              title="Get a Verified Badge"
              description="Show other users you're verified and trustworthy"
            />

            <BenefitItem
              icon="heart"
              title="Increase Your Matches"
              description="Verified profiles get more interest and matches"
            />

            <BenefitItem
              icon="lock-closed"
              title="Secure & Private"
              description="Your verification photo is only for verification and never shown to others"
            />

            <BenefitItem
              icon="people"
              title="Safer Community"
              description="Help us keep cuddles safe for everyone"
            />
          </View>

          {/* How It Works */}
          <View style={styles.howItWorksContainer}>
            <Text style={styles.howItWorksTitle}>How It Works</Text>

            <StepItem
              step={1}
              title="Take a Selfie"
              description="Take a clear photo of your face in good lighting"
            />

            <StepItem
              step={2}
              title="We Review It"
              description="Our team verifies your photo (usually within 24 hours)"
            />

            <StepItem
              step={3}
              title="Get Verified"
              description="Once approved, you'll get a verified badge on your profile"
            />
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyContainer}>
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text style={styles.privacyText}>
              Your verification photo is secure and never shown to other users. It's only used to verify your identity.
            </Text>
          </View>
        </ScrollView>

        {/* Start Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartVerification}
            activeOpacity={0.85}
            disabled={verificationStatus?.status === "verified"}
          >
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>
                {verificationStatus?.status === "verified"
                  ? "Already Verified"
                  : verificationStatus?.status === "pending"
                  ? "Verification Pending"
                  : "Start Verification"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {verificationStatus?.status === "rejected" && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleStartVerification}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry Verification</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>
        <Ionicons name={icon as any} size={20} color="#FF3366" />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

function StepItem({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 140,
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
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  statusCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  howItWorksContainer: {
    marginBottom: 24,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3366",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  privacyContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  startButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
  },
  retryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    backgroundColor: "#FFF0F5",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
});
