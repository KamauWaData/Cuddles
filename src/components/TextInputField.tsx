// src/components/TextInputField.tsx
import { TextInput, View } from 'react-native';

type TextInputFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
};

export default function TextInputField({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
}: TextInputFieldProps) {
  return (
    <View className="w-full mb-4">
      <TextInput
        placeholder={placeholder}
        className="border border-gray-300 rounded-xl px-4 py-3 text-base"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
