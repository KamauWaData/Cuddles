// src/components/PrimaryButton.tsx
import { Text, TouchableOpacity } from 'react-native';

export default function PrimaryButton({ text, onPress }: { text: string, onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-pink-500 py-3 rounded-xl items-center mt-4"
    >
      <Text className="text-white font-semibold text-base">{text}</Text>
    </TouchableOpacity>
  );
}
