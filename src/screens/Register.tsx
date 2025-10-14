import { View, Text, TouchableOpacity } from 'react-native';
import TextInputField from '../components/TextInputField';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export default function Register() {
  const navigation = useNavigation<NavigationProp>();

  const [phoneNumber, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const auth = getAuth();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    navigation.navigate("ProfileName", {
      uid,
      phoneNumber,
      name,
      password,
      email,
    });
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      {/* Logo */}
      <View className="items-center mb-6">
        <Text className="text-4xl font-bold text-pink-500">💘</Text>
      </View>

      {/* Title */}
      <Text className="text-center text-xl font-semibold text-gray-800 mb-1">
        Register an account
      </Text>
      <Text className="text-center text-sm text-gray-500 mb-6">
        Signup with email or phone number
      </Text>

      {/* Form Inputs */}
      <TextInputField placeholder="Enter Phone Number" value={phoneNumber} onChangeText={setPhone} />
      <TextInputField placeholder="Enter Email" value={email} onChangeText={setEmail} />
      <TextInputField placeholder="Name" value={name} onChangeText={setName} />
      <TextInputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInputField placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      {/* Submit */}
      <PrimaryButton text="Submit" onPress={handleSubmit} />

      {/* Already have account */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 items-center">
        <Text className="text-gray-700 font-semibold text-sm">
          Or <Text className="text-black underline">Signin?</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}


