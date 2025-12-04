import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useGalleryPermission, useLocationPermission } from '../../../components/usePermissions';
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "../../../lib/supabase";

export default function EditProfile() {
  const { user } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const router = useRouter();
  const parsedUser = user ? JSON.parse(user as string) : {};

  const [firstName, setFirstName] = useState(parsedUser.firstName || "");
  const [lastName, setLastName] = useState(parsedUser.lastName || "");
  const [avatar, setAvatar] = useState(parsedUser.avatar || "");
  const [gender, setGender] = useState(parsedUser.gender || "");
  const [birthdate, setBirthdate] = useState(
    parsedUser.birthday ? new Date(parsedUser.birthday) : new Date()
  );
  const [interests, setInterests] = useState(parsedUser.interests || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(parsedUser.location || "");
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const requestGalleryPermission = useGalleryPermission();
  const requestLocationPermission = useLocationPermission();

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return;

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

    const upload = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await upload.json();
    setAvatar(data.secure_url);
  };

  // When navigating to SetLocation:
const handleSetLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;
  router.push("/(screens)/SetLocation");
};

// Listen for returned location params:
  useEffect(() => {
    if (params.latitude && params.longitude) {
      setCoords({ latitude: Number(params.latitude), longitude: Number(params.longitude) });
      setLocation(`Lat: ${params.latitude}, Lng: ${params.longitude}`);
    }
  }, [params.latitude, params.longitude]);

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Please fill in your name");
      return;
    }

    // Save location if available
    let profileData: any = {
      id: parsedUser.id,
      firstName,
      lastName,
      avatar,
      gender,
      birthday: birthdate.toISOString().split("T")[0],
      interests,
      updatedAt: new Date().toISOString(),
    };
    if (coords) {
      profileData.latitude = coords.latitude;
      profileData.longitude = coords.longitude;
      profileData.location = location;
    }
    const { error } = await supabase.from("users").upsert(profileData);

    if (error) {
      console.error(error);
      Alert.alert("Failed to save profile");
    } else {
      Alert.alert("Profile updated!");
      router.back();
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <TouchableOpacity onPress={pickImage} className="self-center mb-4">
        <Image
          source={{ uri: avatar || "https://placehold.co/100x100?text=Avatar" }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <Text className="text-center text-pink-600 mt-2">Change Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSetLocation} className="self-center mb-4 bg-blue-100 px-4 py-2 rounded-lg">
        <Text className="text-blue-700">Set Location</Text>
      </TouchableOpacity>
      {location ? <Text className="text-center text-gray-600 mb-2">{location}</Text> : null}

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        className="border p-3 rounded mb-3"
      />

      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        className="border p-3 rounded mb-3"
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} className="border p-3 rounded mb-3">
        <Text>{birthdate.toDateString()}</Text>
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

      <TextInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
        className="border p-3 rounded mb-3"
      />

      <TouchableOpacity
        onPress={handleSave}
        className="bg-pink-500 p-4 rounded mt-4"
      >
        <Text className="text-center text-white font-bold">Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
