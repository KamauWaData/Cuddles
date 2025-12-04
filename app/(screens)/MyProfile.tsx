import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../lib/useSession";
import { supabase } from "../lib/supabase";
import React, { useEffect, useState } from "react";
import BrandedLoading from "../components/BrandedLoading";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { usePermission } from "../lib/usePermissions";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CLOUDINARY_CLOUD_NAME = "dre7tjrrp";
const CLOUDINARY_UPLOAD_PRESET = "my_avatar_preset";

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  gallery?: string[] | null;
  about?: string | null;
  interests?: string[] | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  birthday?: string | null;
  profile_complete?: boolean | null;
}

export default function MyProfile() {
  const router = useRouter();
  const { session, loading } = useSession();
  const user = session?.user;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImageForDelete, setSelectedImageForDelete] = useState<string | null>(null);
  const [showGalleryOptions, setShowGalleryOptions] = useState(false);

  const galleryPermission = usePermission("gallery", {
    onDenied: () => {
      Alert.alert(
        "Permission Denied",
        "Gallery permission is required to upload photos. Please enable it in Settings."
      );
    },
  });

  const cameraPermission = usePermission("camera", {
    onDenied: () => {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to take photos. Please enable it in Settings."
      );
    },
  });

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/(auth)/Login");
      return;
    }
    if (user?.id) fetchProfile();
  }, [user?.id, loading]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setFetchError(error.message ?? "Failed to load profile");
        setProfile(null);
        return;
      }

      setProfile(data);
      setFetchError(null);

      if (data?.avatar_url || data?.avatar) {
        resolveAvatarUrl(data.avatar_url || data.avatar);
      }
    } catch (err: any) {
      setFetchError(err?.message ?? "Unknown error");
      setProfile(null);
    }
  };

  const resolveAvatarUrl = async (avatarValue: string) => {
    try {
      if (avatarValue.startsWith("http")) {
        setAvatarUrl(avatarValue);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(avatarValue);

      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error("resolveAvatarUrl error:", err);
      setAvatarUrl(null);
    }
  };

  const uploadToCloudinary = async (fileUri: string): Promise<string | null> => {
    try {
      const formData = new FormData();

      const fileName = `gallery_${Date.now()}.jpg`;
      formData.append("file", {
        uri: fileUri,
        type: "image/jpeg",
        name: fileName,
      } as any);

      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.secure_url;
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      Alert.alert("Upload Error", error.message || "Failed to upload image to Cloudinary");
      return null;
    }
  };

  const handleAddPhoto = async (source: "camera" | "gallery") => {
    setShowGalleryOptions(false);

    try {
      let result;

      if (source === "camera") {
        const granted = await cameraPermission.request();
        if (!granted) return;

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const granted = await galleryPermission.request();
        if (!granted) return;

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];

      setUploading(true);

      const cloudinaryUrl = await uploadToCloudinary(file.uri);

      if (!cloudinaryUrl) {
        setUploading(false);
        return;
      }

      const currentGallery = profile?.gallery || [];
      const updatedGallery = [...currentGallery, cloudinaryUrl];

      const { error } = await supabase
        .from("profiles")
        .update({ gallery: updatedGallery })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      setProfile((prev) => (prev ? { ...prev, gallery: updatedGallery } : null));
      Alert.alert("Success", "Photo added to your gallery!");
    } catch (error: any) {
      console.error("Add photo error:", error);
      Alert.alert("Error", error.message || "Failed to add photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setUploading(true);
            const updatedGallery = (profile?.gallery || []).filter((url) => url !== photoUrl);

            const { error } = await supabase
              .from("profiles")
              .update({ gallery: updatedGallery })
              .eq("id", user?.id);

            if (error) {
              throw error;
            }

            setProfile((prev) => (prev ? { ...prev, gallery: updatedGallery } : null));
            setSelectedImageForDelete(null);
            Alert.alert("Success", "Photo deleted from your gallery!");
          } catch (error: any) {
            console.error("Delete photo error:", error);
            Alert.alert("Error", error.message || "Failed to delete photo");
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const computeAge = (b?: string | null) => {
    if (!b) return null;
    const bd = new Date(b);
    const now = new Date();
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <BrandedLoading message="Loading profile..." />
        </View>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="person-outline" size={48} color="#FF3366" />
          </View>
          <Text style={styles.emptyTitle}>{fetchError ?? "No profile found"}</Text>
          <View style={styles.emptyButtonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(screens)/profile/EditProfile")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ff69b4", "#ff1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Create Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={fetchProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const displayName =
    profile.name ??
    profile.full_name ??
    `${profile.first_name ?? ""}${profile.first_name && profile.last_name ? " " : ""}${
      profile.last_name ?? ""
    }`.trim() ??
    "Your Name";

  const age = computeAge(profile.birthday);

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={64} color="#FF3366" />
                </View>
              )}
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={() =>
                  router.push({
                    pathname: "/(screens)/profile/EditProfile",
                    params: { data: JSON.stringify(profile) },
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.editAvatarIcon}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>
              {displayName}
              {age ? `, ${age}` : ""}
            </Text>
            {profile.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="#FF3366" />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push({
                  pathname: "/(screens)/profile/EditProfile",
                  params: { data: JSON.stringify(profile) },
                })
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ff69b4", "#ff1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(screens)/Settings")}
              activeOpacity={0.8}
            >
              <View style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={20} color="#FF3366" />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          {profile.about && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionContent}>{profile.about}</Text>
              </View>
            </View>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Interests</Text>
              </View>
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gallery Section */}
          <View style={styles.section}>
            <View style={styles.galleryHeaderContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image-outline" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Gallery</Text>
              </View>
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => setShowGalleryOptions(true)}
                disabled={uploading}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={24} color="#FF3366" />
              </TouchableOpacity>
            </View>

            {profile.gallery && profile.gallery.length > 0 ? (
              <View style={styles.galleryGrid}>
                {profile.gallery.map((photo, index) => (
                  <View key={index} style={styles.galleryItemWrapper}>
                    <TouchableOpacity
                      style={styles.galleryItem}
                      onPress={() => setSelectedImageForDelete(photo)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: photo }} style={styles.galleryImage} />
                      {selectedImageForDelete === photo && (
                        <View style={styles.galleryOverlay}>
                          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>

                    {selectedImageForDelete === photo && (
                      <TouchableOpacity
                        style={styles.deletePhotoButton}
                        onPress={() => handleDeletePhoto(photo)}
                        disabled={uploading}
                      >
                        <Ionicons name="trash" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyGallery}>
                <Ionicons name="images-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyGalleryText}>No photos yet</Text>
                <Text style={styles.emptyGallerySubtext}>
                  Add photos to make your profile more attractive
                </Text>
              </View>
            )}

            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FF3366" size="large" />
                <Text style={styles.uploadingText}>Uploading photo...</Text>
              </View>
            )}
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace("/(auth)/Login");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Gallery Options Modal */}
        <Modal
          visible={showGalleryOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGalleryOptions(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Photo</Text>
                <TouchableOpacity
                  onPress={() => setShowGalleryOptions(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleAddPhoto("camera")}
                disabled={uploading}
              >
                <View style={styles.modalButtonIcon}>
                  <Ionicons name="camera" size={24} color="#FF3366" />
                </View>
                <View style={styles.modalButtonText}>
                  <Text style={styles.modalButtonTitle}>Take Photo</Text>
                  <Text style={styles.modalButtonSubtext}>Use your camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleAddPhoto("gallery")}
                disabled={uploading}
              >
                <View style={styles.modalButtonIcon}>
                  <Ionicons name="images" size={24} color="#FF3366" />
                </View>
                <View style={styles.modalButtonText}>
                  <Text style={styles.modalButtonTitle}>Choose from Gallery</Text>
                  <Text style={styles.modalButtonSubtext}>Select from your photos</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowGalleryOptions(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F3F4F6",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  editAvatarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF3366",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    height: 50,
  },
  actionButtonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  settingsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFE4E6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  settingsButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  galleryHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  addPhotoButton: {
    padding: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionContent: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  interestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3366",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryItemWrapper: {
    position: "relative",
  },
  galleryItem: {
    width: (SCREEN_WIDTH - 48) / 3,
    aspectRatio: 0.9,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: "#F9FAFB",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  galleryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  deletePhotoButton: {
    position: "absolute",
    bottom: -12,
    right: -12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyGallery: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyGalleryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptyGallerySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  uploadingText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    flex: 1,
  },
  modalButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  modalButtonSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  modalCancelButton: {
    paddingVertical: 14,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 16,
  },
});
