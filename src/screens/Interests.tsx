import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigation';
import { supabase } from '../supabase/supabaseClient';

type InterestsNavProp = NativeStackNavigationProp<RootStackParamList, 'Interests'>;
type InterestsRouteProp = RouteProp<RootStackParamList, 'Interests'>;

const INTEREST_OPTIONS = [
  'Sports', 'Music', 'Travel', 'Movies', 'Books', 'Fitness', 'Cooking', 'Art', 'Technology', 'Gaming', 'Art', 'Swimming', 'Hiking', 'Dancing', 'Yoga', 'Photography', 'Writing', 'Cycling', 'Meditation', 'Crafts', 'Gardening',
  'Photography', 'Shopping', 'Theater', 'Volunteering', 'Fishing', 'Running', 'Skiing', 'Snowboarding', 'Surfing', 'Martial Arts', 'Board Games', 'Puzzles', 'Collecting', 'Bird Watching', 'Astrology', 'Genealogy', 'Magic', 'Robotics',
];

export default function Interests() {
    const navigation = useNavigation<InterestsNavProp>();
    const route = useRoute<InterestsRouteProp>();
    const { uid, profile } = route.params;

    const [selected, setSelected] = useState<string[]>([]);

    const toggleInterest = (interest: string) => {
        if (selected.includes(interest)) {
            setSelected(selected.filter(item => item !== interest));
        } else {
            setSelected([...selected, interest]);
        }
    };

    const handleContinue = async () => {
        if (selected.length === 0) {
            Alert.alert('Please select at least one interest');
            return;
        }
    
    const userProfile = {
        ...profile,
        interests: selected,
        profileComplete: true,
        createdAt: new Date().toISOString(),

    };

    try {
        const { data, error } = await supabase
          .from('users')
          .upsert({ id: uid, ...userProfile });
        if (error) {
          console.log('Error Saving profile:', error);
          Alert.alert('Error saving profile. Please try again.');
          return;
        }
        Alert.alert('Profile completed successfully!');
        navigation.replace('Home');
    } catch (err) {
        console.log('Error Saving profile:', err);
        Alert.alert('Error saving profile. Please try again.');
    }
};

return (
    <ScrollView contentContainerStyle={{ padding: 20 }} className="bg-white flex-1">
      <Text className="text-xl font-bold mb-4">Your Interests</Text>
      <Text className="text-gray-500 mb-6">Pick what you love — we'll show people based on it.</Text>

      <View className="flex-row flex-wrap gap-2">
        {INTEREST_OPTIONS.map((interest) => (
          <TouchableOpacity
            key={interest}
            onPress={() => toggleInterest(interest)}
            className={`px-4 py-2 rounded-full border ${
              selected.includes(interest) ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}
          >
            <Text className={selected.includes(interest) ? 'text-white' : 'text-gray-700'}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleContinue}
        className="bg-pink-500 mt-8 p-4 rounded"
      >
        <Text className="text-white text-center font-bold">Finish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}