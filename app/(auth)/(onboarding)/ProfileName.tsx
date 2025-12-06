import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../../../lib/supabase";

export default function ProfileName() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // ========= RECEIVE LOCATION + COORDS FROM SetLocation SCREEN ==========
  useEffect(() => {
    if (params.latitude && params.longitude) {
      setCoords({
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
      });
    }
    if (params.location) {
      setLocation(params.location as string);
    }
  }, [params]);

  // ========= PICK AVATAR ==========
  const pickAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission needed", "Please grant gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 1,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // ========= UPLOAD AVATAR TO SUPABASE STORAGE ==========
  const uploadAvatar = async (localUri: string) => {
    try {
      setAvatarUploading(true);

      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) throw new Error("User not logged in");

      const fileExt = localUri.split(".").pop() || "jpg";
      const filePath = `${uid}/avatar.${fileExt}`;
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: "base64",
      });

      // Convert base64 to Uint8Array for React Native
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, bytes, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (e: any) {
      Alert.alert("Avatar Upload Error", e.message);
      return null;
    } finally {
      setAvatarUploading(false);
    }
  };

  // =============== VALIDATE 18 YEARS RULE =======================
  const is18OrOlder = (date: Date) => {
    const today = new Date();
    const minAgeDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return date <= minAgeDate;
  };

  // ========= CONTINUE / SAVE PROFILE ==========
  const handleContinue = async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw new Error("No authenticated user");

      if (!name.trim()) {
        Alert.alert("Missing name", "Please enter your name.");
        return;
      }

      if (!birthday || !is18OrOlder(birthday)) {
        Alert.alert("Invalid birthday", "You must be at least 18 years old.");
        return;
      }

      if (!coords || !location) {
        Alert.alert("Missing location", "Please select your location.");
        return;
      }

      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadAvatar(avatar);
        if (!avatarUrl) return;
      }

      const profileData = {
        id: uid,
        full_name: name.trim(),
        avatar: avatarUrl,
        birthday: birthday.toISOString(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: location,
        profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (upsertError) {
        console.log("Profile Insert Error:", upsertError);
        Alert.alert("Profile Error", upsertError.message);
        return;
      }

      router.replace("/(main)/Home");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Complete Your Profile</Text>

      {/* Avatar */}
      <TouchableOpacity
        className="self-center w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-6"
        onPress={pickAvatar}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-full h-full" />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Pick Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text className="mb-1 font-semibold">Your Name</Text>
      <TextInput
        className="border border-gray-300 rounded-xl p-3 mb-6"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      {/* Birthday */}
      <Text className="mb-1 font-semibold">Birthday</Text>
      <TouchableOpacity
        onPress={() => setDatePickerVisible(true)}
        className="border border-gray-300 rounded-xl p-3 mb-6"
      >
        <Text className="text-gray-600">
          {birthday ? birthday.toDateString() : "Select your birthday"}
        </Text>
      </TouchableOpacity>

      {datePickerVisible && (
        <DateTimePicker
          mode="date"
          value={birthday || new Date(2000, 0, 1)}
          display="spinner"
          onChange={(event, date) => {
            setDatePickerVisible(false);
            if (date) setBirthday(date);
          }}
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
        />
      )}

      {/* Location */}
      <Text className="mb-1 font-semibold">Location</Text>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(screens)/SetLocation",
            params: { returnTo: "ProfileName" },
          })
        }
        className="border border-gray-300 rounded-xl p-3 mb-6"
      >
        <Text className="text-gray-600">
          {location || "Set your location"}
        </Text>
      </TouchableOpacity>

      {/* Continue */}
      <TouchableOpacity
        disabled={loading || avatarUploading}
        onPress={handleContinue}
        className="bg-[#FF3366] p-4 rounded-xl mt-4"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-white font-semibold text-lg">
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
