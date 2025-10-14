import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function Onboarding() {
    const navigation = useNavigation<NavigationProp>();

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
                onPress={() => navigation.navigate('Register')}
                className="bg-white py-3 rounded-full flex-row items-center justify-center"
                >
                <Text className="text-pink-500 text-base font-semibold">→ Sign up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
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