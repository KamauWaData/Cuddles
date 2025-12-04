import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";
import * as Location from "expo-location";
import DatePreview from "../../../components/DatePreview";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Params = {
  id?: string;
};

export default function ScheduleDate() {
  const { id } = useLocalSearchParams<Params>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("scheduled_dates")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Fetch scheduled_date error:", error);
          Alert.alert("Failed to load the date.");
          return;
        }

        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setImageUrl(data.image_url || "");
        setLocalImageUri(data.image_url || null);
        setDate(data.event_date ? new Date(data.event_date) : new Date());
      } catch (err) {
        console.error("load error", err);
        Alert.alert("Failed to load date data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pickAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow photo access to upload images.");
        return;
      }

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

      setSaving(true);
      const { error: uploadError } = await supabase.storage
        .from("dates")
        .upload(filename, arrayBuffer, {
          contentType: asset.type ?? "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("upload error", uploadError);
        Alert.alert("Upload failed", uploadError.message || "Could not upload image.");
        setSaving(false);
        return;
      }

      const { data: publicData } = supabase.storage.from("dates").getPublicUrl(filename);
      setImageUrl(publicData.publicUrl);
      setSaving(false);
      Alert.alert("Uploaded", "Image uploaded successfully.");
    } catch (err: any) {
      console.error("pick/upload error", err);
      Alert.alert("Image error", err?.message || "Failed to upload image.");
      setSaving(false);
    }
  };

  const removeImage = async () => {
    setImageUrl("");
    setLocalImageUri(null);
  };

  const validate = () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a title for the date.");
      return false;
    }
    if (!location.trim()) {
      Alert.alert("Validation", "Please enter a location.");
      return false;
    }
    if (!date || isNaN(date.getTime())) {
      Alert.alert("Validation", "Please pick a valid date and time.");
      return false;
    }
    return true;
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location Permission", "Please grant location access.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) {
        Alert.alert("Not signed in", "Please sign in to post a date.");
        setSaving(false);
        return;
      }

      const payload = {
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim(),
        image_url: imageUrl || null,
        event_date: date.toISOString(),
        is_active: true,
      };

      if (id) {
        const { error } = await supabase.from("scheduled_dates").update(payload).eq("id", id);
        if (error) {
          console.error("update error", error);
          Alert.alert("Update failed", error.message || "Could not update the date.");
          setSaving(false);
          return;
        }
        Alert.alert("Updated", "Date updated successfully.");
      } else {
        const { error } = await supabase.from("scheduled_dates").insert([payload]);
        if (error) {
          console.error("insert error", error);
          Alert.alert("Save failed", error.message || "Could not create the date.");
          setSaving(false);
          return;
        }
        Alert.alert("Posted", "Date posted successfully.");
      }

      router.replace("/(screens)/dates/MyDates");
    } catch (err: any) {
      console.error("save error", err);
      Alert.alert("Save error", err?.message || "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
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
          <Text style={styles.headerTitle}>{id ? "Edit Date" : "Schedule a Date"}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Image Section */}
          <TouchableOpacity onPress={pickAndUploadImage} style={styles.imageSection}>
            {localImageUri || imageUrl ? (
              <Image source={{ uri: localImageUri || imageUrl }} style={styles.dateImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#FF3366" />
                <Text style={styles.placeholderText}>Add a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {(imageUrl || localImageUri) && (
            <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
              <Ionicons name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.removeImageText}>Remove image</Text>
            </TouchableOpacity>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date Title</Text>
              <TextInput
                placeholder="e.g. Sunset picnic at the pier"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                placeholder="e.g. The Pier, West Bay"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
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
                <Text style={styles.detectedText}>
                  Location detected: {lat.toFixed(5)}, {lng.toFixed(5)}
                </Text>
              </View>
            )}

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                placeholder="Add more details, what to bring, dress code..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Date & Time */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
                <Ionicons name="calendar" size={20} color="#FF3366" />
                <Text style={styles.dateInputText}>{date ? date.toLocaleString() : "Pick date & time"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (Platform.OS !== "ios") setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}

          {/* Preview */}
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

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} disabled={saving} activeOpacity={0.85} style={styles.submitButton}>
            <LinearGradient colors={["#ff69b4", "#ff1493"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{id ? "Update Date" : "Post Date"}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  dateImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  removeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  removeImageText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
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
  autoDetectText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
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
  detectedText: {
    color: "#166534",
    fontWeight: "500",
    fontSize: 13,
    flex: 1,
  },
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
  dateInputText: {
    fontSize: 15,
    color: "#1F2937",
    flex: 1,
  },
  previewSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
  },
});
