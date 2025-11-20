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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";
import * as Location from "expo-location";
import DatePreview from "../../../components/DatePreview";


type Params = {
  id?: string; // optional: when present we are editing an existing post
};

export default function ScheduleDate() {
  const { id } = useLocalSearchParams<Params>();
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState<string>(""); // public url
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // preview
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // fetch existing post if editing
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

  // pick image and upload to supabase storage
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

      // upload to Supabase Storage 'dates' bucket
      // create a unique file path
      const ext = asset.uri.split(".").pop() ?? "jpg";
      const filename = `dates/${Date.now()}.${ext}`;

      // fetch uri and convert to arrayBuffer (works in Expo)
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

  // remove image (both preview and remote) - remote removal optional; here we only remove from form
  const removeImage = async () => {
    setImageUrl("");
    setLocalImageUri(null);
    // optionally delete file from storage if you want; requires keeping the file path
    // supabase.storage.from('dates').remove(['dates/123.jpg'])
  };

  // validation
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


  // create or update
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
        // update existing
        const { error } = await supabase.from("scheduled_dates").update(payload).eq("id", id);
        if (error) {
          console.error("update error", error);
          Alert.alert("Update failed", error.message || "Could not update the date.");
          setSaving(false);
          return;
        }
        Alert.alert("Updated", "Date updated successfully.");
      } else {
        // insert new
        const { error } = await supabase.from("scheduled_dates").insert([payload]);
        if (error) {
          console.error("insert error", error);
          Alert.alert("Save failed", error.message || "Could not create the date.");
          setSaving(false);
          return;
        }
        Alert.alert("Posted", "Date posted successfully.");
      }

      // navigate back to MyDates (owner list) after save
      router.replace("/(main)/dates/MyDates");
    } catch (err: any) {
      console.error("save error", err);
      Alert.alert("Save error", err?.message || "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6" keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold mb-4">{id ? "Edit Date" : "Schedule a Date"}</Text>

      {/* Image picker & preview */}
      <TouchableOpacity onPress={pickAndUploadImage} className="mb-4">
        {localImageUri ? (
          <Image source={{ uri: localImageUri }} style={{ width: "100%", height: 200, borderRadius: 12 }} />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 200, borderRadius: 12 }} />
        ) : (
          <View className="w-full h-48 bg-gray-100 rounded items-center justify-center">
            <Text className="text-gray-500">Add an image for the date (optional)</Text>
          </View>
        )}
      </TouchableOpacity>

      {imageUrl || localImageUri ? (
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={removeImage} className="px-3 py-2 bg-red-100 rounded">
            <Text className="text-red-600">Remove image</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Title */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
      <TextInput
        placeholder="e.g. Sunset picnic at the pier"
        value={title}
        onChangeText={setTitle}
        className="border border-gray-200 rounded p-3 mb-4"
      />

      {/* Location */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Location</Text>
      <TextInput
        placeholder="e.g. The Pier, West Bay"
        value={location}
        onChangeText={setLocation}
        className="border border-gray-200 rounded p-3 mb-4"
      />

      <TouchableOpacity
        onPress={getLocation}
        className="bg-blue-100 border border-blue-300 p-3 rounded mb-3"
      >
        <Text className="text-blue-700 font-medium">
          Auto-detect my location for this date
        </Text>
      </TouchableOpacity>

      {lat && lng ? (
        <Text className="text-gray-600 mb-4">
          Location detected: {lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      ) : null}


      {/* Description */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Description (optional)</Text>
      <TextInput
        placeholder="Add more details, what to bring, dress code..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        className="border border-gray-200 rounded p-3 mb-4 text-gray-700"
        style={{ minHeight: 96, textAlignVertical: "top" }}
      />

      {/* Date & time */}
      <Text className="text-sm font-medium text-gray-700 mb-1">Date & time</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-200 rounded p-3 mb-3"
      >
        <Text>{date ? date.toLocaleString() : "Pick date & time"}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            // on Android the picker returns once
            if (Platform.OS !== "ios") setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
          minimumDate={new Date()} // no past dates
        />
      )}

      <DatePreview
        title={title}
        description={description}
        location={location}
        date={date}
        imageUrl={localImageUri || imageUrl}
      />

      {/* Save */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-pink-500 p-4 rounded mt-6 mb-8 items-center justify-center"
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">{id ? "Update Date" : "Post Date"}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
