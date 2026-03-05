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
import { getUserAttributes, saveUserAttributes, UserAttributes } from "../../../lib/advancedFilters";
import Slider from "@react-native-community/slider";

export default function EditProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const parsedUser = params.data ? JSON.parse(params.data as string) : (params.user ? JSON.parse(params.user as string) : {});

  // --------------------------
  // STATE
  // --------------------------
  const [firstName, setFirstName] = useState(parsedUser.first_name || parsedUser.firstName || "");
  const [lastName, setLastName] = useState(parsedUser.last_name || parsedUser.lastName || "");
  const [about, setAbout] = useState(parsedUser.about || "");
  const [avatar, setAvatar] = useState(parsedUser.avatar_url || parsedUser.avatar || "");
  const [gender, setGender] = useState(parsedUser.gender || "");
  const [birthdate, setBirthdate] = useState(
    parsedUser.birthday ? new Date(parsedUser.birthday) : new Date()
  );
  const [location, setLocation] = useState(parsedUser.location || "");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Lifestyle attributes
  const [height, setHeight] = useState(170);
  const [smoking, setSmoking] = useState<UserAttributes["smoking"]>("not_specified");
  const [drinking, setDrinking] = useState<UserAttributes["drinking"]>("not_specified");
  const [education, setEducation] = useState<UserAttributes["education"]>("not_specified");
  const [religion, setReligion] = useState<UserAttributes["religion"]>("not_specified");
  const [relationshipType, setRelationshipType] = useState<UserAttributes["relationship_type"]>("not_specified");

  const [showDatePicker, setShowDatePicker] = useState(false);

  const requestGalleryPermission = useGalleryPermission();
  const requestLocationPermission = useLocationPermission();

  // --------------------------
  // FETCH ATTRIBUTES
  // --------------------------
  useEffect(() => {
    const fetchAttrs = async () => {
      if (parsedUser.id) {
        const attrs = await getUserAttributes(parsedUser.id);
        if (attrs) {
          if (attrs.height_cm) setHeight(attrs.height_cm);
          if (attrs.smoking) setSmoking(attrs.smoking);
          if (attrs.drinking) setDrinking(attrs.drinking);
          if (attrs.education) setEducation(attrs.education);
          if (attrs.religion) setReligion(attrs.religion);
          if (attrs.relationship_type) setRelationshipType(attrs.relationship_type);
        }
      }
    };
    fetchAttrs();
  }, [parsedUser.id]);

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
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatar,
      gender,
      about,
      birthday: birthdate.toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };

    if (coords) {
      profileData.latitude = coords.latitude;
      profileData.longitude = coords.longitude;
      profileData.location = location;
    }

    const { error } = await supabase.from("profiles").upsert(profileData);

    if (error) {
      console.log(error);
      Alert.alert("Failed", "Profile update failed.");
      return;
    }

    // Save lifestyle attributes
    await saveUserAttributes({
      height_cm: height,
      smoking,
      drinking,
      education,
      religion,
      relationship_type: relationshipType,
    });

    Alert.alert("Success", "Profile updated!");
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      {/* Avatar */}
      <TouchableOpacity onPress={pickImage} className="self-center mb-2">
        <Image
          source={{ uri: avatar || "https://placehold.co/120x120?text=Avatar" }}
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
        <Text className="text-center text-pink-600 mt-2 font-semibold">
          Change Photo
        </Text>
      </TouchableOpacity>
      {avatar && (
        <TouchableOpacity onPress={deleteAvatar} className="self-center mb-6">
          <Text className="text-center text-red-600 font-semibold text-sm">
            Delete Avatar
          </Text>
        </TouchableOpacity>
      )}

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

      {/* LIFESTYLE */}
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-4">Lifestyle</Text>

        {/* Height */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-700 font-medium">Height</Text>
            <Text className="text-pink-600 font-bold">{height} cm</Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={140}
            maximumValue={220}
            step={1}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor="#FF69B4"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#FF1493"
          />
        </View>

        {/* Smoking */}
        <Text className="text-gray-700 font-medium mb-3">Smoking</Text>
        <View className="flex-row gap-2 flex-wrap mb-6">
          {[
            { label: "Never", value: "never" },
            { label: "Sometimes", value: "sometimes" },
            { label: "Regularly", value: "regularly" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSmoking(opt.value as any)}
              className={`px-3 py-2 rounded-xl border ${
                smoking === opt.value
                  ? "bg-pink-500 border-pink-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  smoking === opt.value ? "text-white font-bold" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Drinking */}
        <Text className="text-gray-700 font-medium mb-3">Drinking</Text>
        <View className="flex-row gap-2 flex-wrap mb-4">
          {[
            { label: "Never", value: "never" },
            { label: "Sometimes", value: "sometimes" },
            { label: "Regularly", value: "regularly" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setDrinking(opt.value as any)}
              className={`px-3 py-2 rounded-xl border ${
                drinking === opt.value
                  ? "bg-pink-500 border-pink-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  drinking === opt.value ? "text-white font-bold" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ADVANCED INFO */}
      <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <Text className="text-gray-800 font-bold text-lg mb-4">Advanced Details</Text>

        {/* Education */}
        <Text className="text-gray-700 font-medium mb-3">Education</Text>
        <View className="flex-row gap-2 flex-wrap mb-6">
          {[
            { label: "High School", value: "high_school" },
            { label: "Bachelors", value: "bachelors" },
            { label: "Masters", value: "masters" },
            { label: "PhD", value: "phd" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setEducation(opt.value as any)}
              className={`px-3 py-2 rounded-xl border ${
                education === opt.value
                  ? "bg-pink-500 border-pink-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  education === opt.value ? "text-white font-bold" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Religion */}
        <Text className="text-gray-700 font-medium mb-3">Religion</Text>
        <View className="flex-row gap-2 flex-wrap mb-6">
          {[
            { label: "Christian", value: "christian" },
            { label: "Muslim", value: "muslim" },
            { label: "Jewish", value: "jewish" },
            { label: "Hindu", value: "hindu" },
            { label: "Buddhist", value: "buddhist" },
            { label: "Atheist", value: "atheist" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setReligion(opt.value as any)}
              className={`px-3 py-2 rounded-xl border ${
                religion === opt.value
                  ? "bg-pink-500 border-pink-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  religion === opt.value ? "text-white font-bold" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Relationship Type */}
        <Text className="text-gray-700 font-medium mb-3">Looking for</Text>
        <View className="flex-row gap-2 flex-wrap">
          {[
            { label: "Casual", value: "casual" },
            { label: "Serious", value: "serious" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setRelationshipType(opt.value as any)}
              className={`px-4 py-2 rounded-xl border ${
                relationshipType === opt.value
                  ? "bg-pink-500 border-pink-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  relationshipType === opt.value ? "text-white font-bold" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
