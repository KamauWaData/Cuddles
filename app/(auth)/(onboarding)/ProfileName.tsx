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
import { supabase } from "../../../lib/supabase"; // ✅ Adjust path as per your structure

export default function ProfileName() {
  const { uid } = useLocalSearchParams(); // ✅ replaces useRoute()
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState("");

  // 📸 Pick & upload avatar
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        Alert.alert("No image selected");
        return null;
      }

      const file = result.assets[0];
      const CLOUD_NAME = "dre7tjrrp";
      const UPLOAD_PRESET = "my_avatar_preset";

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed", data);
        Alert.alert("Upload failed", data?.error?.message || "Unknown error");
        return null;
      }

      return data.secure_url;
    } catch (err: any) {
      console.error("Upload error", err);
      Alert.alert("Upload error", err.message || "Unknown error");
      return null;
    }
  };

  const handleAvatarUpload = async () => {
    const url = await pickImage();
    if (url) setAvatar(url);
  };

  // 📝 Save user profile
  const handleContinue = async () => {
    if (!firstName || !lastName || !birthdate) {
      Alert.alert("Please fill all fields");
      return;
    }

    try {
      let resolvedUid = uid as string;
      if (!resolvedUid) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          Alert.alert("Authentication error. Please sign in again.");
          return;
        }
        resolvedUid = userData.user.id;
      }

      const { error } = await supabase.from("users").upsert([
        {
          id: resolvedUid,
          firstName,
          lastName,
          birthday: birthdate.toISOString().split("T")[0],
          avatar,
          profileComplete: false,
        },
      ]);

      if (error) {
        console.error("Supabase upsert error", error);
        Alert.alert("Error saving profile.");
        return;
      }

      // ✅ Navigate to Gender screen using Expo Router
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
    } catch (err) {
      console.error("Profile save error:", err);
      Alert.alert("Error saving profile.");
    }
  };

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      {/* Avatar Upload */}
      <TouchableOpacity onPress={handleAvatarUpload} className="self-center mb-4">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{ width: 96, height: 96, borderRadius: 48 }}
          />
        ) : (
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#6b7280" }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={{
          borderWidth: 1,
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={{
          borderWidth: 1,
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      {/* Birthday Picker */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 1,
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text>{birthdate ? birthdate.toDateString() : "Choose Birthday"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthdate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setBirthdate(date);
          }}
        />
      )}

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        className="bg-pink-500 p-4 rounded"
      >
        <Text className="text-white text-center font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
