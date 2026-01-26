import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";
import { useGalleryPermission, useLocationPermission } from "../../../components/usePermissions";

export default function EditProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const parsedUser = params.user ? JSON.parse(params.user as string) : {};

  // --------------------------
  // STATE
  // --------------------------
  const [firstName, setFirstName] = useState(parsedUser.firstName || "");
  const [lastName, setLastName] = useState(parsedUser.lastName || "");
  const [about, setAbout] = useState(parsedUser.about || "");
  const [avatar, setAvatar] = useState(parsedUser.avatar || "");
  const [gender, setGender] = useState(parsedUser.gender || "");
  const [birthdate, setBirthdate] = useState(
    parsedUser.birthday ? new Date(parsedUser.birthday) : new Date()
  );
  const [location, setLocation] = useState(parsedUser.location || "");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const requestGalleryPermission = useGalleryPermission();
  const requestLocationPermission = useLocationPermission();

  // --------------------------
  // PICK AVATAR → Upload to Supabase Storage
  // --------------------------
  const pickImage = async () => {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission needed", "Allow gallery access to pick images.");
    return;
  }

  // Launch picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,  // <-- fixed
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) return;

  const asset = result.assets[0];

  // Convert URI to Base64 (new expo format)
  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: "base64",   // <--- FIXED
  });

  const fileName = `avatar-${parsedUser.id}-${Date.now()}.jpg`;
  const fileBytes = Buffer.from(base64, "base64");

  // Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, fileBytes, {
      upsert: true,
      contentType: "image/jpeg",
    });

  if (uploadError) {
    console.log(uploadError);
    Alert.alert("Upload failed", "Could not upload avatar");
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  setAvatar(urlData.publicUrl);
};

const deleteAvatar = async () => {
  Alert.alert("Delete Avatar", "Are you sure you want to remove your avatar?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          if (avatar && avatar.includes("/storage/v1/object/public/avatars/")) {
            const urlParts = avatar.split("/storage/v1/object/public/avatars/")[1];
            if (urlParts) {
              await supabase.storage.from("avatars").remove([urlParts]);
            }
          }
          setAvatar("");
          Alert.alert("Success", "Avatar deleted successfully.");
        } catch (err: any) {
          Alert.alert("Error", err.message || "Failed to delete avatar.");
        }
      },
    },
  ]);
};

  // --------------------------
  // Return location from SetLocation screen
  // --------------------------
  useEffect(() => {
    if (params.latitude && params.longitude) {
      setCoords({
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
      });
      setLocation(`Lat: ${params.latitude}, Lng: ${params.longitude}`);
    }
  }, [params.latitude, params.longitude]);

  // --------------------------
  // SAVE PROFILE
  // --------------------------
  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Missing Fields", "Please fill in your name.");
      return;
    }

    const profileData: any = {
      id: parsedUser.id,
      firstName,
      lastName,
      avatar,
      gender,
      about,
      birthday: birthdate.toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    };

    if (coords) {
      profileData.latitude = coords.latitude;
      profileData.longitude = coords.longitude;
      profileData.location = location;
    }

    const { error } = await supabase.from("users").upsert(profileData);

    if (error) {
      console.log(error);
      Alert.alert("Failed", "Profile update failed.");
      return;
    }

    Alert.alert("Success", "Profile updated!");
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} className="self-center mb-6">
        <Image
          source={{ uri: avatar || "https://placehold.co/120x120?text=Avatar" }}
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
        <Text className="text-center text-pink-600 mt-2 font-semibold">
          Change Photo
        </Text>
      </TouchableOpacity>

      {/* Card */}
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-2">Basic Info</Text>

        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          className="border border-gray-200 p-3 rounded-xl mb-3"
        />

        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          className="border border-gray-200 p-3 rounded-xl mb-3"
        />

        {/* Gender Pills */}
        <Text className="text-gray-700 font-medium mb-2">Gender</Text>
        <View className="flex-row mb-3">
          {["Male", "Female", "Other"].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              className={`px-4 py-2 mr-2 rounded-full ${
                gender === g ? "bg-pink-500" : "bg-gray-100"
              }`}
            >
              <Text
                className={
                  gender === g ? "text-white font-semibold" : "text-gray-700"
                }
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Birthday */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-200 p-3 rounded-xl mb-3"
        >
          <Text className="text-gray-700">{birthdate.toDateString()}</Text>
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
      </View>

      {/* ABOUT */}
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-2">About You</Text>
        <TextInput
          placeholder="Write something about yourself..."
          value={about}
          onChangeText={setAbout}
          multiline
          className="border border-gray-200 p-3 rounded-xl h-32 text-gray-800"
        />
      </View>

      {/* LOCATION */}
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-2">Location</Text>

        <TouchableOpacity
          onPress={() => router.push("/(screens)/SetLocation")}
          className="bg-blue-100 px-4 py-3 rounded-xl mb-2"
        >
          <Text className="text-blue-700 font-semibold">Choose Location</Text>
        </TouchableOpacity>

        {location ? (
          <Text className="text-gray-600">{location}</Text>
        ) : (
          <Text className="text-gray-400 italic">No location set</Text>
        )}
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={handleSave}
        className="bg-pink-500 p-4 rounded-xl mb-10"
      >
        <Text className="text-center text-white font-bold text-lg">
          Save Changes
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
