import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";
import DatePreview from "../../../components/DatePreview";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function EditScheduleDate() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const [date, setDate] = useState(new Date());
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [storagePath, setStoragePath] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      const { data, error } = await supabase
        .from("scheduled_dates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Alert.alert("Error", "Failed to load date details.");
        return;
      }

      setTitle(data.title);
      setLocation(data.location);
      setDescription(data.description || "");
      setDate(new Date(data.event_date));
      setImageUrl(data.image_url || "");
      setLocalImageUri(data.image_url);
      setLat(data.lat || null);
      setLng(data.lng || null);

      if (data.image_url) {
        const parts = data.image_url.split("/dates/");
        if (parts.length > 1) setStoragePath("dates/" + parts[1]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0];
    setLocalImageUri(asset.uri);

    const ext = asset.uri.split(".").pop() ?? "jpg";
    const filename = `dates/${Date.now()}.${ext}`;

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage.from("dates").upload(filename, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (error) {
      Alert.alert("Image Upload Failed", error.message);
      return;
    }

    const { data } = supabase.storage.from("dates").getPublicUrl(filename);
    setImageUrl(data.publicUrl);
    setStoragePath(filename);
  }

  async function deletePost() {
    Alert.alert("Delete", "Are you sure you want to delete this post?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);

          if (storagePath) {
            await supabase.storage.from("dates").remove([storagePath]);
          }

          await supabase.from("scheduled_dates").delete().eq("id", id);

          setSaving(false);
          Alert.alert("Deleted", "Your date has been removed.");
          router.replace("/(main)/dates/MyDates");
        },
      },
    ]);
  }

  async function saveUpdates() {
    setSaving(true);

    const payload = {
      title,
      description,
      location,
      image_url: imageUrl,
      event_date: date.toISOString(),
      lat,
      lng,
    };

    const { error } = await supabase.from("scheduled_dates").update(payload).eq("id", id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Updated!", "Your date has been updated.");
    router.replace("/(main)/dates/MyDates");
  }

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
  };

  if (loading)
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      </LinearGradient>
    );

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Date</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={pickImage} style={styles.imageSection}>
            {localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.dateImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#FF3366" />
                <Text style={styles.placeholderText}>Update photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                placeholder="Date title"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                placeholder="Location"
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity onPress={getLocation} style={styles.autoDetectButton}>
              <Ionicons name="locate" size={18} color="#FFFFFF" />
              <Text style={styles.autoDetectText}>Auto-detect location</Text>
            </TouchableOpacity>

            {lat && lng && (
              <View style={styles.locationDetectedBox}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.detectedText}>Detected: {lat.toFixed(5)}, {lng.toFixed(5)}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                placeholder="Description"
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
                <Ionicons name="calendar" size={20} color="#FF3366" />
                <Text style={styles.dateInputText}>{date.toLocaleString()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              onChange={(e, d) => {
                setShowPicker(false);
                if (d) setDate(d);
              }}
            />
          )}

          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <DatePreview
              title={title}
              description={description}
              location={location}
              date={date}
              imageUrl={localImageUri || imageUrl}
            />
          </View>

          <TouchableOpacity onPress={saveUpdates} disabled={saving} style={styles.saveButton}>
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={deletePost} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Post</Text>
          </TouchableOpacity>
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
  imageSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    height: 220,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dateImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  textArea: { minHeight: 100, textAlignVertical: "top", paddingTop: 12 },
  autoDetectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    marginBottom: 12,
  },
  autoDetectText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  locationDetectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    marginBottom: 12,
  },
  detectedText: { color: "#166534", fontWeight: "500", fontSize: 13, flex: 1 },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  dateInputText: { fontSize: 15, color: "#1F2937", flex: 1 },
  previewSection: { marginHorizontal: 16, marginBottom: 16 },
  previewTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 12 },
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 17 },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  deleteButtonText: { color: "#DC2626", fontWeight: "700", fontSize: 17 },
});
