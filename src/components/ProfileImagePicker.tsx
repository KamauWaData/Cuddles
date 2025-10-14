// src/components/ProfileImagePicker.tsx
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileImagePicker({ onImagePicked }: { onImagePicked: (uri: string) => void }) {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} className="items-center mt-4">
      {image ? (
        <Image source={{ uri: image }} className="w-24 h-24 rounded-full" />
      ) : (
        <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
          <Text className="text-gray-500">+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
