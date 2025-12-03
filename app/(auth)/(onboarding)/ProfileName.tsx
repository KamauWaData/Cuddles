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
// Use the legacy import for readAsStringAsync to avoid the deprecated runtime behavior
import * as FileSystem from "expo-file-system";
import { readAsStringAsync as readAsStringAsyncLegacy } from "expo-file-system/legacy";
import { supabase } from "../../../lib/supabase";
import SkipButton from "../../../components/onboarding/SkipButton";
import TextInputField from "../../../components/TextInputField";
import { LinearGradient } from "expo-linear-gradient";

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
      // ✅ Ensure user is authenticated before uploading
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser?.user?.id) {
        Alert.alert("Authentication required", "Please sign in to upload photos.");
        console.warn("Auth check failed:", authError);
        return;
      }

      // ✅ Get the session token explicitly to pass to storage upload
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        Alert.alert("Session error", "Could not retrieve auth token. Please try again.");
        console.warn("No access token available");
        return;
      }

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
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${authUser.user.id}/${fileName}`;

      // ✅ Read as base64 safely using the legacy implementation which preserves the
      // old signature and runtime behavior. The modern API recommends using
      // new File().text() for other flows.
      const base64 = await readAsStringAsyncLegacy(file.uri, {
        encoding: "base64",
      });

      // Convert base64 to binary Uint8Array for upload
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      console.log(`Uploading to path: ${filePath}, User ID: ${authUser.user.id}, Token: ${accessToken.substring(0, 20)}...`);

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, byteArray, {
          contentType: file.mimeType ?? "image/jpeg",
          upsert: true,
          cacheControl: "max-age=3600",
        });

      if (error) throw error;

      // Get the public URL for the ACTUAL FILE, not the folder
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatar(publicUrlData.publicUrl);
      Alert.alert("Uploaded", "Profile photo uploaded successfully!");
      console.log("Upload successful:", publicUrlData.publicUrl);
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
        pathname: "/(auth)/(onboarding)/Gender",
        params: {
          uid: resolvedUid,
          profile: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            birthday: birthdate.toISOString().split("T")[0],
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
    <LinearGradient
      colors={["#fff0f5", "#ffe4e1"]}
      className="flex-1 p-6 justify-between"
    >
      <View>
        <View className="flex-row justify-between items-center mb-8">
          <View className="w-8" />
          <Text className="text-lg font-semibold text-gray-800">Step 1 of 3</Text>
          <SkipButton
            to="/(auth)/(onboarding)/Gender"
            onSkip={async () => {
              try {
                await supabase.from("users").upsert({
                  id: uid,
                  name: null,
                  profile_complete: false,
                  updatedAt: new Date().toISOString(),
                });
                router.push("/(main)/home");
              } catch (err) {
                console.error("Skip upsert error:", err);
              }
            }}
          />
        </View>

        {/* Progress indicator */}
        <View className="w-full h-1 bg-gray-200 mb-10 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-1/3" />
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-3">Welcome!</Text>
        <Text className="text-gray-600 text-base mb-10">Let's get to know you a little better</Text>

        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarUpload} className="self-center mb-8">
          {avatar ? (
            <View className="relative">
              <Image
                source={{ uri: avatar }}
                style={{ width: 140, height: 140, borderRadius: 70 }}
              />
              <View className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-3">
                <Text className="text-white text-xs">📷</Text>
              </View>
            </View>
          ) : (
            <View className="w-32 h-32 rounded-full bg-white border-2 border-pink-300 justify-center items-center shadow-sm">
              <Text className="text-4xl">📷</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Inputs */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">First Name</Text>
          <TextInputField
            placeholder="e.g., Sarah"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Last Name</Text>
          <TextInputField
            placeholder="e.g., Johnson"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Birthday */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Birthday</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="border border-gray-300 rounded-lg p-4 bg-white flex-row justify-between items-center"
          >
            <Text className={birthdate ? "text-gray-800 font-medium" : "text-gray-400"}>
              {birthdate ? birthdate.toLocaleDateString() : "Select your birthday"}
            </Text>
            <Text className="text-xl">📅</Text>
          </TouchableOpacity>
        </View>

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
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#ff69b4", "#ff1493"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 rounded-2xl shadow-lg"
        >
          <Text className="text-center text-white font-bold text-lg">Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}
