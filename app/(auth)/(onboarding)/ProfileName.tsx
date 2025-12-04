import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useGalleryPermission, useLocationPermission } from '../../../components/usePermissions';
import DateTimePicker from "@react-native-community/datetimepicker";
// Use the legacy import for readAsStringAsync to avoid the deprecated runtime behavior
import * as FileSystem from "expo-file-system";
import { readAsStringAsync as readAsStringAsyncLegacy } from "expo-file-system/legacy";
import { supabase } from "../../../lib/supabase";
import SkipButton from "../../../components/onboarding/SkipButton";
import TextInputField from "../../../components/TextInputField";
import { LinearGradient } from "expo-linear-gradient";


export default function ProfileName() {
  const [loading, setLoading] = useState(false);
  const [navLoading, setNavLoading] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const requestGalleryPermission = useGalleryPermission();
  const requestLocationPermission = useLocationPermission();

  // Handler for avatar upload
  const handleAvatarUpload = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Handler for Set Location navigation
  const handleSetLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    // Navigate to SetLocation screen and handle callback via router event or context
    router.push({ pathname: '/(screens)/SetLocation', params: {} });
    // In a real app, use a context or event to get the result back
  };

  // Handler for continue
  const handleContinue = async () => {
    // Enforce 18+ check before allowing continue
    if (!birthdate) {
      Alert.alert('Please select your birthday.');
      return;
    }
    const today = new Date();
    const minBirthdate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    if (birthdate > minBirthdate) {
      Alert.alert('You must be at least 18 years old to use Cuddles.');
      return;
    }
    setLoading(true);
    try {
      // Get user id
      let { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        Alert.alert("Authentication error", "Please sign in again.");
        return;
      }
      const uid = userData.user.id;
      let profileData: any = {
        id: uid,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birthday: birthdate ? birthdate.toISOString().split("T")[0] : null,
        avatar: avatar,
        profile_complete: false
      };
      if (coords) {
        profileData.latitude = coords.latitude;
        profileData.longitude = coords.longitude;
        profileData.location = location;
      }
      const { error } = await supabase.from("profiles").upsert([profileData]);
      if (error) {
        Alert.alert("Profile error", error.message);
        return;
      }
      router.push({ pathname: "/(auth)/(onboarding)/Gender", params: { uid } });
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-6 pt-12 bg-white" keyboardShouldPersistTaps="handled">
        <Text className="text-3xl font-bold text-gray-900 mb-3">Welcome!</Text>
        <Text className="text-gray-600 text-base mb-2">Let's get to know you a little better</Text>
        <Text className="text-xs text-red-500 mb-8 font-semibold">18+ Only. You must be at least 18 years old to use Cuddles.</Text>
        {/* Avatar */}
        <TouchableOpacity
          onPress={handleAvatarUpload}
          className="self-center mb-4"
          activeOpacity={loading ? 1 : 0.7}
          disabled={loading}
        >
          {avatar ? (
            <View className="relative">
              <Image
                source={{ uri: avatar }}
                style={{ width: 140, height: 140, borderRadius: 70, opacity: loading ? 0.5 : 1 }}
              />
              <View className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-3">
                <Text className="text-white text-xs">📷</Text>
              </View>
            </View>
          ) : (
            <View className="w-36 h-36 bg-gray-200 rounded-full items-center justify-center">
              <Text className="text-4xl">📷</Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Set Location */}
        <TouchableOpacity
          onPress={handleSetLocation}
          className="bg-blue-100 px-4 py-2 rounded-lg self-center mb-2"
        >
          <Text className="text-blue-700">Set Location</Text>
        </TouchableOpacity>
        {location ? <Text className="text-center text-gray-600 mb-2">{location}</Text> : null}
        {/* Name fields */}
        <TextInputField
          label="First Name"
          placeholder="e.g., Sarah"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <TextInputField
          label="Last Name"
          placeholder="e.g., Johnson"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        {/* Birthday picker */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <Text className="text-base text-gray-700 mb-2">Birthday</Text>
            <View className="border p-3 rounded bg-gray-50">
              <Text>{birthdate ? birthdate.toDateString() : "Select your birthday"}</Text>
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate || new Date()}
              mode="date"
              display="default"
              onChange={(_event: any, date?: Date) => {
                setShowDatePicker(false);
                if (date) {
                  // Enforce 18+ age
                  const today = new Date();
                  const minBirthdate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                  if (date > minBirthdate) {
                    Alert.alert('You must be at least 18 years old to use Cuddles.');
                    setBirthdate(null);
                  } else {
                    setBirthdate(date);
                  }
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>
        {/* Continue button */}
        <TouchableOpacity
          className="bg-pink-500 py-4 rounded-lg mt-8 mb-4"
          onPress={handleContinue}
          activeOpacity={loading ? 1 : 0.7}
          disabled={loading}
        >
          <Text className="text-white text-center text-lg font-bold">{loading ? "Please wait..." : "Continue"}</Text>
        </TouchableOpacity>
        <SkipButton
          to="/(auth)/(onboarding)/Gender"
        />
        <View className="w-full h-1 bg-gray-200 mb-10 rounded-full overflow-hidden">
          <View className="h-full bg-pink-500 w-1/3" />
        </View>
        {/* Add navigation to verification, safety, and profile improvements */}
        <TouchableOpacity
          onPress={() => {
            setNavLoading("verification");
            router.push("/(screens)/verification/VerificationIntro");
            setTimeout(() => setNavLoading("") , 500);
          }}
          className="bg-purple-100 py-3 rounded-lg mb-3"
          activeOpacity={navLoading === "verification" ? 1 : 0.7}
          disabled={!!navLoading}
        >
          <Text className="text-purple-700 text-center font-semibold">{navLoading === "verification" ? "Loading..." : "Go to Verification"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setNavLoading("safety");
            router.push("/(screens)/safety/SafetyTips");
            setTimeout(() => setNavLoading("") , 500);
          }}
          className="bg-yellow-100 py-3 rounded-lg mb-3"
          activeOpacity={navLoading === "safety" ? 1 : 0.7}
          disabled={!!navLoading}
        >
          <Text className="text-yellow-700 text-center font-semibold">{navLoading === "safety" ? "Loading..." : "View Safety Tips"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setNavLoading("badges");
            router.push("/(screens)/profile-improvements/ProfileBadges");
            setTimeout(() => setNavLoading("") , 500);
          }}
          className="bg-blue-100 py-3 rounded-lg mb-3"
          activeOpacity={navLoading === "badges" ? 1 : 0.7}
          disabled={!!navLoading}
        >
          <Text className="text-blue-700 text-center font-semibold">{navLoading === "badges" ? "Loading..." : "See Profile Badges"}</Text>
        </TouchableOpacity>
        {/* Birthday DateTimePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onChange={(_event: any, date?: Date) => {
              if (Platform.OS !== "ios") setShowDatePicker(false);
              if (date) setBirthdate(date);
            }}
          />
        )}
      {/* Continue Button */}
      <TouchableOpacity
        onPress={handleContinue}
        activeOpacity={0.85}
        className="bg-pink-500 py-4 rounded-lg mt-8 mb-4"
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-bold">{loading ? "Please wait..." : "Continue"}</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}
