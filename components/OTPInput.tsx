// src/components/OTPInput.tsx
import { View, TextInput } from 'react-native';

export default function OTPInput({ value, onChange }: { value: string[], onChange: (val: string[], index: number) => void }) {
  return (
    <View className="flex-row justify-between w-full mt-6 px-4">
      {value.map((digit, index) => (
        <TextInput
          key={index}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={(text) => onChange(text, index)}
          className="border border-gray-300 text-center text-lg rounded-xl w-12 h-12"
        />
      ))}
    </View>
  );
}
