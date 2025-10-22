import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import TextInputField from '../components/TextInputField';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<NavigationProp>();
  const [input, setInput] = useState('');
  const [isPhone, setIsPhone] = useState<boolean>(true); 
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!input || (isPhone ? false : !password)) {
      Alert.alert('Please fill all fields');
      return;
    }

    try {
      if (isPhone) {
        const { data, error } = await supabase.auth.signInWithOtp({ phone: input });
        if (error) {
          console.log(error);
          Alert.alert('Login failed', error.message);
          return;
        }
        Alert.alert('OTP Sent', 'Check your phone for the login code');
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input,
          password,
        });
        if (error) {
          console.log(error);
          Alert.alert('Login failed', error.message);
          return;
        }
        const user = data.user;
        if (!user) {
          Alert.alert('Login failed', 'No user returned');
          return;
        }

        // Check user's profile row to decide next screen
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          // No profile yet — go complete profile
          navigation.navigate('ProfileName', { uid: user.id });
        } else if (profile.profileComplete) {
          navigation.replace('Home');
        } else {
          navigation.navigate('ProfileName', { uid: user.id });
        }
      }

    } catch (err: any) {
      console.log(err);
      Alert.alert('Login failed', err.message || 'Unknown error');
    }
    
  };

    return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-center mb-6">Login</Text>

      <TouchableOpacity onPress={() => setIsPhone(!isPhone)} className="mb-4">
        <Text className="text-pink-500 text-center underline">
          {isPhone ? 'Use Email Instead' : 'Use Phone Instead'}
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder={isPhone ? 'Phone Number' : 'Email'}
        value={input}
        onChangeText={setInput}
        className="border px-4 py-3 rounded mb-4"
        keyboardType={isPhone ? 'phone-pad' : 'email-address'}
      />

      {!isPhone && (
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border px-4 py-3 rounded mb-6"
        />
      )}

      <TouchableOpacity onPress={handleLogin} className="bg-pink-500 p-4 rounded">
        <Text className="text-center text-white font-bold">Login</Text>
      </TouchableOpacity>
    </View>
  );
}