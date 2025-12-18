import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function VerifyPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>Photo Verification</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 24 }}>
        Please take a selfie to verify your identity. This photo will not be shown to other users.
      </Text>
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: 180, height: 180, borderRadius: 90, marginBottom: 24 }} />
      ) : null}
      <Button title={photo ? "Retake Photo" : "Take Photo"} onPress={pickPhoto} />
      {/* Add upload and verification logic here */}
    </View>
  );
}
