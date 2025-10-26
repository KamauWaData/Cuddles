import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Onboarding() {

    return (
        <View className="flex-1 justify-between items-center bg-pink-500 px-6 py-10">
            {/* Top Images */}
            <View className="w-full items-center space-y-[-60] mt-10">
               {/* <Image
                source={require('../../assets/avatar1.png')}
                className="w-32 h-32 rounded-full"
                resizeMode="cover"
                />*/}
                <Ionicons name="person-circle-outline" size={100} color="#f43f5e" style={{ width: 128, height: 128, borderRadius: 64 }}/>
                <Ionicons name="person-circle-outline" size={100} color="#f43f5e" style={{ width: 128, height: 128, borderRadius: 64 }}/>
                {/*<Image
                source={require('../../assets/avatar2.png')}
                className="w-32 h-32 rounded-full"
                resizeMode="cover"
                /> */}
            </View>
        

        {/* Welcome Text */}
            <View className="items-center mt-6">
                <Text className="text-white text-2xl font-bold">Welcome to cuddles</Text>
                <Text className="text-white text-sm mt-2">Meet your better half in minutes!</Text>
            </View>

            {/* Buttons */}
            <View className="w-full mt-10">
                <TouchableOpacity
                onPress={() => router.push('/(auth)/Register')}
                className="bg-white py-3 rounded-full flex-row items-center justify-center"
                >
                <Text className="text-pink-500 text-base font-semibold">→ Sign up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => router.push('/(auth)/Login')}
                className="mt-4 items-center"
                >
                <Text className="text-white text-sm">
                    Already have an account? <Text className="underline">Signin</Text>
                </Text>
                </TouchableOpacity>
            </View>
            </View>
        );
}