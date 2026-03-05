import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapPickerScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="items-center gap-4">
        <Text className="text-xl font-semibold">Map Picker</Text>
        <Text className="text-gray-600">Not available on web</Text>
        <Text className="text-sm text-gray-500">Use iOS or Android app</Text>
      </View>
    </SafeAreaView>
  );
}
