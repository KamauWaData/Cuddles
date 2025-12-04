import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { blockUser, reportUser } from "../../lib/block";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Profile {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  birthday?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  about?: string;
  interests?: string[];
  gallery?: string[];
  avatar?: string;
  avatar_url?: string;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Profile load error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    const firstName = profile?.first_name || "";
    const lastName = profile?.last_name || "";
    return `${firstName} ${lastName}`.trim() || "User";
  };

  const getAge = () => {
    if (profile?.age) return profile.age;
    if (!profile?.birthday) return null;

    const birthDate = new Date(profile.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getImages = (): string[] => {
    const images = [];

    if (profile?.avatar_url) {
      images.push(profile.avatar_url);
    } else if (profile?.avatar) {
      images.push(profile.avatar);
    }

    if (profile?.gallery && Array.isArray(profile.gallery)) {
      images.push(...profile.gallery);
    }

    return images;
  };

  const images = getImages();
  const age = getAge();

  const handleBlock = async () => {
    Alert.alert("Block User", "Are you sure you want to block this user? You won't see them again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: async () => {
          try {
            const { data: authData } = await supabase.auth.getUser();
            const myId = authData?.user?.id;
            if (!myId) {
              Alert.alert("Error", "You must be signed in");
              return;
            }
            await blockUser(myId, profile?.id!);
            Alert.alert("Blocked", "User has been blocked.");
            router.back();
          } catch (error) {
            console.error("Block error:", error);
            Alert.alert("Error", "Failed to block user");
          }
        },
      },
    ]);
  };

  const handleReport = async () => {
    Alert.alert(
      "Report User",
      "Why are you reporting this user?",
      [
        {
          text: "Inappropriate behavior",
          onPress: () => submitReport("Inappropriate behavior"),
        },
        { text: "Spam/Fake profile", onPress: () => submitReport("Spam/Fake profile") },
        { text: "Underage", onPress: () => submitReport("Underage") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const myId = authData?.user?.id;
      if (!myId) {
        Alert.alert("Error", "You must be signed in");
        return;
      }
      await reportUser(myId, profile?.id!, reason);
      Alert.alert("Reported", "Thanks for flagging. We'll review this profile.");
    } catch (error) {
      console.error("Report error:", error);
      Alert.alert("Error", "Failed to report user");
    }
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.centerContent}>
          <Ionicons name="person" size={48} color="#FF3366" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.centerContent}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.loadingText}>Profile not found</Text>
          <TouchableOpacity style={styles.backSmallButton} onPress={() => router.back()}>
            <Text style={styles.backSmallButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert("Options", "", [
                { text: "Block User", onPress: handleBlock, style: "destructive" },
                { text: "Report User", onPress: handleReport, style: "destructive" },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <View style={styles.gallerySection}>
            {images.length > 0 ? (
              <View>
                {/* Main Image */}
                <View style={styles.mainImageContainer}>
                  <Animated.Image
                    source={{ uri: images[currentImageIndex] }}
                    style={[styles.mainImage, { opacity: fadeAnim }]}
                  />

                  {/* Image Navigation Overlays */}
                  {images.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={styles.imageSideButton}
                        onPress={prevImage}
                        disabled={currentImageIndex === 0}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={32}
                          color={currentImageIndex === 0 ? "#FFFFFF44" : "#FFFFFF"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.imageSideButton, styles.imageSideButtonRight]}
                        onPress={nextImage}
                        disabled={currentImageIndex === images.length - 1}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={32}
                          color={currentImageIndex === images.length - 1 ? "#FFFFFF44" : "#FFFFFF"}
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        {currentImageIndex + 1} / {images.length}
                      </Text>
                    </View>
                  )}

                  {/* Gradient Overlay for Text */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.4)"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.imageGradient}
                  >
                    <View style={styles.imageBottomInfo}>
                      <Text style={styles.nameAndAge}>
                        {getDisplayName()}
                        {age && <Text style={styles.ageText}>, {age}</Text>}
                      </Text>
                      {profile.location && (
                        <View style={styles.locationBadge}>
                          <Ionicons name="location" size={14} color="#FFFFFF" />
                          <Text style={styles.locationBadgeText}>{profile.location}</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </View>

                {/* Image Indicators Dots */}
                {images.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {images.map((_, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dot,
                          index === currentImageIndex && styles.dotActive,
                        ]}
                        onPress={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noImageText}>No photos available</Text>
              </View>
            )}
          </View>

          {/* About Section */}
          {profile.about && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>About Me</Text>
              </View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionText}>{profile.about}</Text>
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
              <View style={styles.interestsList}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location Info */}
          {profile.location && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionText}>{profile.location}</Text>
              </View>
            </View>
          )}

          {/* Additional Photos */}
          {profile.gallery && profile.gallery.length > 0 && images.length > 1 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="images-outline" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>More Photos</Text>
              </View>
              <View style={styles.galleryGrid}>
                {profile.gallery.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryGridItem}
                    onPress={() => setCurrentImageIndex(images.indexOf(photo))}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photo }} style={styles.galleryGridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons at Bottom */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBlock}
              activeOpacity={0.8}
            >
              <View style={styles.blockButton}>
                <Ionicons name="close" size={24} color="#EF4444" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReport}
              activeOpacity={0.8}
            >
              <View style={styles.reportButton}>
                <Ionicons name="flag" size={24} color="#F59E0B" />
              </View>
            </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
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
  moreButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gallerySection: {
    marginBottom: 20,
  },
  mainImageContainer: {
    width: SCREEN_WIDTH,
    height: 500,
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageSideButton: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "20%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 12,
  },
  imageSideButtonRight: {
    left: undefined,
    right: 0,
    alignItems: "flex-end",
    paddingRight: 12,
    paddingLeft: 0,
  },
  imageCounter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
  },
  imageBottomInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nameAndAge: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ageText: {
    fontWeight: "700",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  locationBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: "#FF3366",
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: 400,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noImageText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
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
  sectionText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    backgroundColor: "#FFF0F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FFE4E6",
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
  galleryGridItem: {
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
  galleryGridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  blockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  reportButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  backSmallButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FFF0F5",
    borderRadius: 10,
  },
  backSmallButtonText: {
    color: "#FF3366",
    fontWeight: "600",
    fontSize: 16,
  },
});
