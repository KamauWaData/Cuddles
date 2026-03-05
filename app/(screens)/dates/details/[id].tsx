import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ScheduleDateDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const meId = auth?.user?.id;

      const { data, error } = await supabase
        .from("scheduled_dates")
        .select(`*, owner:profiles(id, first_name, avatar)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setItem(data);

      setIsOwner(meId === data.user_id);

      const { data: req } = await supabase
        .from("date_requests")
        .select("*")
        .eq("scheduled_date_id", id)
        .eq("requester_id", meId)
        .single();
      setMyRequest(req || null);
    } catch (err) {
      console.error(err);
      Alert.alert("failed to load");
    } finally {
      setLoading(false);
    }
  };

  const requestToJoin = async (message?: string) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const meId = auth?.user?.id;
      if (!meId) {
        Alert.alert("Please sign in");
        return;
      }

      const { error } = await supabase.from("date_requests").insert({
        scheduled_date_id: id,
        requester_id: meId,
        message: message || "",
      });

      if (error) throw error;
      Alert.alert("Request sent");
      await fetchDetails();
    } catch (err) {
      console.error(err);
      Alert.alert("Request failed");
    }
  };

  if (loading)
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      </LinearGradient>
    );

  if (!item)
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3366" />
          <Text style={styles.errorText}>Date not found</Text>
        </View>
      </LinearGradient>
    );

  const eventDate = new Date(item.event_date);

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Date Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Image */}
          {item.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
            </View>
          )}

          {/* Content Card */}
          <View style={styles.contentCard}>
            {/* Title & Location */}
            <Text style={styles.title}>{item.title}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#FF3366" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#FF3366" />
              <Text style={styles.infoText}>{eventDate.toLocaleString()}</Text>
            </View>

            {/* Description */}
            {item.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.sectionContent}>{item.description}</Text>
              </View>
            )}

            {/* Host Info */}
            {item.owner && (
              <View style={styles.hostSection}>
                <View style={styles.hostHeader}>
                  <Text style={styles.sectionTitle}>Host</Text>
                </View>
                <View style={styles.hostCard}>
                  {item.owner.avatar ? (
                    <Image source={{ uri: item.owner.avatar }} style={styles.hostAvatar} />
                  ) : (
                    <View style={styles.hostAvatarPlaceholder}>
                      <Ionicons name="person" size={24} color="#FF3366" />
                    </View>
                  )}
                  <View style={styles.hostInfo}>
                    <Text style={styles.hostName}>{item.owner.first_name || "Host"}</Text>
                    <Text style={styles.hostLabel}>Organizer</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Action Section */}
          {!isOwner ? (
            <View style={styles.actionSection}>
              {myRequest ? (
                <View style={styles.statusBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View>
                    <Text style={styles.statusLabel}>Request Status</Text>
                    <Text style={[styles.statusValue, { color: myRequest.status === "accepted" ? "#10B981" : "#F59E0B" }]}>
                      {myRequest.status.charAt(0).toUpperCase() + myRequest.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => requestToJoin()} style={styles.interestButton} activeOpacity={0.85}>
                  <LinearGradient
                    colors={["#ff69b4", "#ff1493"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="heart" size={20} color="#FFFFFF" />
                    <Text style={styles.interestButtonText}>I'm Interested</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.actionSection}>
              <View style={styles.ownerBox}>
                <Ionicons name="checkmark-circle" size={20} color="#FF3366" />
                <Text style={styles.ownerText}>You posted this date</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(main)/dates/MyDates")} style={styles.viewButton} activeOpacity={0.85}>
                <Text style={styles.viewButtonText}>Manage Requests</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1F2937" },
  headerSpacer: { width: 40 },
  errorText: { fontSize: 18, color: "#1F2937", marginTop: 12, fontWeight: "600" },
  imageContainer: {
    height: 280,
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  image: { width: "100%", height: "100%" },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 15, color: "#6B7280", fontWeight: "500", flex: 1 },
  section: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  sectionContent: { fontSize: 15, color: "#6B7280", lineHeight: 22 },
  hostSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  hostHeader: { marginBottom: 12 },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
  },
  hostAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  hostAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hostInfo: { flex: 1 },
  hostName: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 2 },
  hostLabel: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  actionSection: { marginHorizontal: 16, marginBottom: 32 },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  statusLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  statusValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  ownerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFE4E6",
  },
  ownerText: { fontSize: 15, color: "#FF3366", fontWeight: "600" },
  interestButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  interestButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 17 },
  viewButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FFE4E6",
    borderWidth: 2,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  viewButtonText: { color: "#FF3366", fontWeight: "700", fontSize: 16 },
});
