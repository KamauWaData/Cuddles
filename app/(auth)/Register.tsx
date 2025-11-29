import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router, useRouter } from 'expo-router';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async () => {
    const e = email.trim();
    if (!e || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all fields.');

    }

    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert('Error', error.message);
    Alert.alert('Success', 'Check your email for confirmation');
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 15, color: '#1F41BB', textAlign: 'center', fontFamily: 'poppins' }}>Sign Up</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 90, textAlign: 'center', fontFamily: 'poppins' }}>Create an account to continue...</Text>
        <TextInputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInputField
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PrimaryButton text="Register" onPress={handleRegister} />
        <Text
          style={{ textAlign: 'center', marginTop: 20, fontWeight: 'bold', fontFamily: 'poppins' }}
          onPress={() => router.push('/(auth)/login')}
        >
          Already have an account? 
        <Text style={{ textAlign: 'center', marginTop: 20, fontWeight: 'bold', fontFamily: 'poppins', color: '#1F41BB', }}> Login</Text>
        </Text>
            </ScrollView>
    </KeyboardAvoidingView>
  );
}
