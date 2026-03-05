import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { submitSelfieVerification, getVerificationStatus } from "../../../lib/verification";
import { usePermission } from "../../../lib/usePermissions";

type Screen = "preview" | "camera" | "review" | "submitted";

export default function VerifyPhoto() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [screen, setScreen] = useState<Screen>("preview");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cameraPermission = usePermission("camera", {
    onDenied: () => {
      Alert.alert("Camera Permission Required", "Please enable camera access in settings to take a selfie.");
    },
  });

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setPhoto(result?.uri);
      setScreen("review");
    } catch (error) {
      console.error("Take photo error:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setPhoto(result.assets[0].uri);
        setScreen("review");
      }
    } catch (error) {
      console.error("Pick image error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert("No Photo", "Please take or upload a photo first.");
      return;
    }

    try {
      setSubmitting(true);

      const verification = await submitSelfieVerification(photo);

      if (verification) {
        setScreen("submitted");
        setTimeout(() => {
          Alert.alert("Success", "Your verification has been submitted! We'll review it shortly.", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
        }, 1000);
      } else {
        Alert.alert("Error", "Failed to submit verification. Please try again.");
      }
    } catch (error) {
      console.error("Submit verification error:", error);
      Alert.alert("Error", "Failed to submit verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setScreen("preview");
  };

  // Preview Screen
  if (screen === "preview") {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FF3366" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Photo Verification</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.contentContainer}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.illustrationCircle}>
                <Ionicons name="camera" size={60} color="#FF3366" />
              </View>
            </View>

            {/* Instructions */}
            <Text style={styles.title}>Take a Selfie</Text>
            <Text style={styles.subtitle}>
              Please take a clear photo of your face. Make sure your face is well-lit and clearly visible.
            </Text>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <TipItem icon="sun" text="Good lighting - face is well-lit" />
              <TipItem icon="maximize" text="Face covers most of the photo" />
              <TipItem icon="close-circle" text="No filters or heavy makeup" />
              <TipItem icon="camera" text="Clear and in focus" />
            </View>

            <View style={styles.spacer} />
          </View>

          {/* Action Buttons */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={async () => {
                const granted = await cameraPermission.request();
                if (granted) {
                  setScreen("camera");
                }
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#ff69b4", "#ff1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Take a Selfie</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleChooseFromGallery}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="images" size={20} color="#FF3366" />
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Camera Screen
  if (screen === "camera") {
    return (
      <SafeAreaView edges={["top"]} style={styles.cameraContainer}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => setScreen("preview")} style={styles.cameraBackButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.cameraHeaderTitle}>Take Selfie</Text>
          <View style={styles.headerSpacer} />
        </View>

        <CameraView ref={cameraRef} facing="front" style={styles.camera} ratio="1:1" />

        <View style={styles.cameraFooter}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Review Screen
  if (screen === "review") {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleRetake} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FF3366" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Photo</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.contentContainer}>
            {/* Photo */}
            <View style={styles.photoContainer}>
              {photo && <Image source={{ uri: photo }} style={styles.photoImage} />}
            </View>

            {/* Review Instructions */}
            <Text style={styles.reviewTitle}>Does this look good?</Text>
            <Text style={styles.reviewSubtitle}>
              Make sure your face is clearly visible and well-lit. You can retake the photo if needed.
            </Text>

            {/* Checklist */}
            <View style={styles.checklistContainer}>
              <ChecklistItem text="Face is clearly visible" />
              <ChecklistItem text="Good lighting" />
              <ChecklistItem text="No filters or effects" />
            </View>

            <View style={styles.spacer} />
          </View>

          {/* Action Buttons */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetake}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Text style={styles.secondaryButtonText}>Retake Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <LinearGradient
                colors={["#ff69b4", "#ff1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Submit for Verification</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Submitted Screen
  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>

          <Text style={styles.successTitle}>Verification Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for verifying your profile. Our team will review your photo and get back to you within 24 hours.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoText}>
              You'll receive a notification once your verification is approved. Your verified badge will appear on your
              profile!
            </Text>
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipIconContainer}>
        <Ionicons name={icon as any} size={20} color="#FF3366" />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <View style={styles.checklistItem}>
      <View style={styles.checkmark}>
        <Ionicons name="checkmark" size={16} color="#10B981" />
      </View>
      <Text style={styles.checklistText}>{text}</Text>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cameraBackButton: {
    padding: 8,
  },
  cameraHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  camera: {
    flex: 1,
  },
  cameraFooter: {
    paddingVertical: 24,
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  photoContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  reviewSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  checklistContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  checklistText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#065F46",
    flex: 1,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  doneButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spacer: {
    flex: 1,
  },
});
