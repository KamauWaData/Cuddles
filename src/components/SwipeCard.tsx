// src/components/SwipeCard.tsx
import { View, Text, Image } from 'react-native';

export default function SwipeCard({ name, age, image }: { name: string, age: number, image: string }) {
  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-md">
      <Image source={{ uri: image }} className="w-full h-96" />
      <View className="p-4">
        <Text className="text-xl font-bold">{name}, {age}</Text>
      </View>
    </View>
  );
}
