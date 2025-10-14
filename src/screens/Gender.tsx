import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type GenderScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Gender'>;
type GenderScreenRouteProp = RouteProp<RootStackParamList, 'Gender'>;

const genderOptions = ['Man', 'Woman'];

export default function Gender() {
    const navigation = useNavigation<GenderScreenNavProp>();
    const route = useRoute<GenderScreenRouteProp>();

    const { uid, profile } = route.params;

    const [gender, setGender] = useState('');
    const [showMe, setShowMe] = useState<string[]>([]);

    const toggleShowMe = (option: string) => {
        if (showMe.includes(option)) {
        setShowMe(showMe.filter(item => item !== option));
        } else {
        setShowMe([...showMe, option]);
        }
};

const handleContinue = () => {
    if (!gender || showMe.length === 0) {
      Alert.alert('Please select your gender and who to show you');
      return;
    }

    navigation.navigate('Interests', {
      uid,
      profile: {
        ...profile,
        gender,
        showMe,
      },
    });
  };

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-xl font-bold mb-4">I am a</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setGender(option)}
            className={`px-4 py-2 rounded-full border ${
              gender === option ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}
          >
            <Text className={gender === option ? 'text-white' : 'text-gray-700'}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-xl font-bold mb-4">Show me</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => toggleShowMe(option)}
            className={`px-4 py-2 rounded-full border ${
              showMe.includes(option) ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}
          >
            <Text className={showMe.includes(option) ? 'text-white' : 'text-gray-700'}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleContinue} className="bg-pink-500 p-4 rounded">
        <Text className="text-white text-center font-bold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
