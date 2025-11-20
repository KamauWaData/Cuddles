import { View, Text, Image } from "react-native";

export default function DatePreview({ title, description, location, date, imageUrl }) {
  if (!title && !description && !location && !imageUrl) return null;

  return (
    <View className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <Text className="text-lg font-semibold mb-1">Preview</Text>

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 180, borderRadius: 10 }}
          className="mb-3"
        />
      ) : null}

      <Text className="text-xl font-bold">{title}</Text>

      <Text className="text-gray-600 mt-1">{description}</Text>

      <Text className="mt-2 text-pink-500 font-medium">{location}</Text>

      <Text className="mt-1 text-gray-700">{date?.toLocaleString()}</Text>
    </View>
  );
}
