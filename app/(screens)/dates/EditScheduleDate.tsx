import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";
import DatePreview from "../../../components/DatePreview";

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

      // extract bucket path from full URL
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );

  return (
    <ScrollView className="flex-1 p-6 bg-white">

      <Text className="text-2xl font-bold mb-4">Edit Date</Text>

      <TouchableOpacity onPress={pickImage}>
        {localImageUri ? (
          <Image source={{ uri: localImageUri }} style={{ width: "100%", height: 200, borderRadius: 12 }} />
        ) : (
          <View className="w-full h-48 bg-gray-100 rounded items-center justify-center">
            <Text>Add an image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Title"
        className="border border-gray-200 p-3 rounded mt-4"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Location"
        className="border border-gray-200 p-3 rounded mt-3"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        placeholder="Description"
        className="border border-gray-200 p-3 rounded mt-3"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-200 p-3 rounded mt-3"
      >
        <Text>{date.toLocaleString()}</Text>
      </TouchableOpacity>

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

      {/* Autofill location */}
      <TouchableOpacity
        onPress={getLocation}
        className="bg-blue-100 p-3 rounded mt-3"
      >
        <Text className="text-blue-700">Auto-detect location</Text>
      </TouchableOpacity>

      {lat && lng ? (
        <Text className="mt-1 text-gray-600">Detected: {lat}, {lng}</Text>
      ) : null}

      {/* Preview */}
      <DatePreview
        title={title}
        description={description}
        location={location}
        date={date}
        imageUrl={localImageUri || imageUrl}
      />

      <TouchableOpacity
        onPress={saveUpdates}
        className="bg-pink-500 p-4 rounded mt-6"
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Save Changes</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={deletePost}
        className="bg-red-500 p-4 rounded mt-4"
      >
        <Text className="text-white text-center font-semibold">Delete Post</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
