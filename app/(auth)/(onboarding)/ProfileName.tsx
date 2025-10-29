import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../../lib/supabase";

export default function ProfileName() {
  const { uid } = useLocalSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState<string>("");

  // 📸 Pick & upload image to Supabase Storage
  const handleAvatarUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // ✅ NEW style — replaces deprecated MediaTypeOptions
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      const fileExt = file.uri.split(".").pop() || "jpg";
      const filePath = `avatars/${uid ?? Date.now()}.${fileExt}`;

      // ✅ Read as base64 safely (no EncodingType)
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "base64",
      });

      // Convert base64 to binary Uint8Array for upload
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, byteArray, {
          contentType: file.mimeType ?? "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatar(publicUrlData.publicUrl);
      Alert.alert("Uploaded", "Profile photo uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Upload failed", err.message || "Unexpected error");
    }
  };

  // 💾 Save profile info
  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim() || !birthdate) {
      Alert.alert("Missing fields", "Please fill all the fields first.");
      return;
    }

    try {
      let resolvedUid = uid as string;
      if (!resolvedUid) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          Alert.alert("Authentication error", "Please sign in again.");
          return;
        }
        resolvedUid = userData.user.id;
      }

      const { error } = await supabase.from("profiles").upsert([
        {
          id: resolvedUid,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          birthday: birthdate.toISOString().split("T")[0],
          avatar,
          profile_complete: false,
        },
      ]);

      if (error) throw error;

      router.push({
        pathname: "/(auth)/Gender",
        params: {
          uid: resolvedUid,
          profile: JSON.stringify({
            firstName,
            lastName,
            birthdate: birthdate.toISOString().split("T")[0],
            avatar,
          }),
        },
      });
    } catch (err: any) {
      console.error("Profile save error:", err);
      Alert.alert("Error", err.message || "Failed to save profile.");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Avatar */}
      <TouchableOpacity
        onPress={handleAvatarUpload}
        className="self-center mb-6"
      >
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center">
            <Text className="text-gray-600 text-sm">Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        className="border border-gray-300 rounded-lg p-4 mb-4"
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        className="border border-gray-300 rounded-lg p-4 mb-4"
      />

      {/* Birthday */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="border border-gray-300 rounded-lg p-4 mb-6"
      >
        <Text className="text-gray-800">
          {birthdate ? birthdate.toDateString() : "Select Birthday"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthdate ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setShowDatePicker(false);
            if (date) setBirthdate(date);
          }}
        />
      )}

      {/* Continue */}
      <TouchableOpacity
        onPress={handleContinue}
        className="bg-pink-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
