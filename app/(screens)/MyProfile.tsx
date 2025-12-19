import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabase";
import React, { useEffect, useState } from "react";
import BrandedLoading from "../../components/BrandedLoading";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/build/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useGalleryPermission } from "../../components/usePermissions";

// Set your storage bucket name (change if different)
const AVATAR_BUCKET = "avatars";

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  avatar?: string | null;    // can be complete URL or storage object name
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

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/(auth)/login");
      return;
    }
    if (user?.id) fetchProfile();
  }, [user?.id, loading]);

  // Fetch profile row
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

      // Resolve avatar URL after fetching profile
      if (data?.avatar) resolveAvatarUrl(data.avatar);

    } catch (err: any) {
      setFetchError(err?.message ?? "Unknown error");
      setProfile(null);
    }
  };

  // Turn a Supabase storage path into a public URL
  const resolveAvatarUrl = async (avatarValue: string) => {
    try {
      // If avatar is already a full URL (Cloudinary, etc.)
      if (avatarValue.startsWith("http")) {
        setAvatarUrl(avatarValue);
        return;
      }

      // Otherwise treat it as a storage object path: "avatars/USER-ID.jpg"
      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(avatarValue);

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

  if (loading)
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <BrandedLoading message="Loading profile..." />
        </View>
      </LinearGradient>
    );

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

  // Utility: compute display name + age
  const displayName =
    profile.name ??
    profile.full_name ??
    `${profile.first_name ?? ""}${
      profile.first_name && profile.last_name ? " " : ""
    }${profile.last_name ?? ""}`.trim() ??
    "Your Name";

  // Navigation buttons for verification, safety, and profile improvements
  const NavigationButtons = () => (
    <View style={{ marginVertical: 20, gap: 10 }}>
      <TouchableOpacity
        onPress={() => router.push("/(screens)/verification/VerificationIntro")}
        style={styles.navButton}
        activeOpacity={0.85}
      >
        <Ionicons name="shield-checkmark" size={20} color="#7c3aed" />
        <Text style={styles.navButtonText}>Go to Verification</Text>
        <Ionicons name="chevron-forward" size={18} color="#7c3aed" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/(screens)/safety/SafetyTips")}
        style={styles.navButton}
        activeOpacity={0.85}
      >
        <Ionicons name="warning" size={20} color="#ca8a04" />
        <Text style={styles.navButtonText}>View Safety Tips</Text>
        <Ionicons name="chevron-forward" size={18} color="#ca8a04" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/(screens)/profile-improvements/ProfileBadges")}
        style={styles.navButton}
        activeOpacity={0.85}
      >
        <Ionicons name="star" size={20} color="#2563eb" />
        <Text style={styles.navButtonText}>See Profile Badges</Text>
        <Ionicons name="chevron-forward" size={18} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );

  const computeAge = (b?: string | null) => {
    if (!b) return null;
    const bd = new Date(b);
    const now = new Date();
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return age;
  };

  const age = computeAge(profile?.birthday);

  // Use the shared hook from components/usePermissions
  // If you want to keep the local version, move the call to the top level
  // import { useGalleryPermission } from '../../components/usePermissions';
  const requestGalleryPermission = useGalleryPermission ? useGalleryPermission() : async () => true;

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
                  <Ionicons name="pencil" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Name and Basic Info */}
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
            {/* Action Buttons 
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
            </TouchableOpacity>*/}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(screens)/settings")}
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
            <View style={styles.sectionHeader}>
              <Ionicons name="image-outline" size={20} color="#FF3366" />
              <Text style={styles.sectionTitle}>Gallery</Text>
            </View>
            <View style={styles.galleryGrid}>
              {/* Add Photo Tile */}
              <TouchableOpacity
                style={[styles.galleryItem, styles.addPhotoTile]}
                activeOpacity={0.8}
                onPress={async () => {
                  try {
                    const hasPermission = await requestGalleryPermission();
                    if (!hasPermission) return;
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [1, 1],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                      const uri = result.assets[0].uri;
                      // Upload to Cloudinary
                      const url = await uploadToCloudinary(uri);
                      // Update Supabase
                      const newGallery = [...(profile.gallery || []), url];
                      const { error } = await supabase.from('profiles').update({ gallery: newGallery }).eq('id', profile.id);
                      if (error) throw error;
                      setProfile({ ...profile, gallery: newGallery });
                    }
                  } catch (err: any) {
                    Alert.alert('Upload failed', err.message || 'Could not upload image.');
                  }
                }}
              >
                <View style={styles.addPhotoContent}>
                  <Ionicons name="add" size={32} color="#FF3366" />
                  <Text style={{ color: '#FF3366', fontWeight: '600', marginTop: 4 }}>Add Photo</Text>
                </View>
              </TouchableOpacity>
              {/* Gallery Images */}
              {(profile.gallery || []).map((pic, index) => (
                <View key={index} style={styles.galleryItem}>
                  <Image source={{ uri: pic }} style={styles.galleryImage} />
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={async () => {
                      Alert.alert('Delete Photo', 'Are you sure you want to remove this photo?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete', style: 'destructive', onPress: async () => {
                            const newGallery = (profile.gallery || []).filter((_, i) => i !== index);
                            const { error } = await supabase.from('profiles').update({ gallery: newGallery }).eq('id', profile.id);
                            if (!error) setProfile({ ...profile, gallery: newGallery });
                          }
                        }
                      ]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={28} color="#FF3366" style={{ backgroundColor: 'white', borderRadius: 14 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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

          <NavigationButtons />
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
    marginTop: 20,
    marginBottom: 28,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 18,
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
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
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
    lineHeight: 24,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
    gap: 10,
  },
  galleryItem: {
    width: "31%",
    aspectRatio: 0.9,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    marginTop: 28,
  },
  logoutButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
  },
  addPhotoTile: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addPhotoContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  deleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});
