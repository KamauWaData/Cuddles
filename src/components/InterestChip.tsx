// src/components/InterestChip.tsx
import { TouchableOpacity, Text } from 'react-native';

export default function InterestChip({ label, selected, onToggle }: { label: string, selected: boolean, onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className={`px-4 py-2 rounded-full border ${
        selected ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300'
      }`}
    >
      <Text className={`${selected ? 'text-white' : 'text-gray-800'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
