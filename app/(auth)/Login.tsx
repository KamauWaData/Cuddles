import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    console.log('LoginScreen mounted');
  }, []);

  const handleLogin = async () => {
    console.log('handleLogin', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('supabase signIn error', error);
        return Alert.alert('Login failed', error.message);
      }
      console.log('login success', data);
      router.replace('/(main)/home');
    } catch (err) {
      console.error('unexpected login error', err);
      Alert.alert('Login failed', String(err));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Welcome Back</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text
        style={{ textAlign: 'center', marginTop: 20, color: 'blue' }}
        onPress={() => router.push('/(auth)/register')}
      >
        Don’t have an account? Register
      </Text>
    </View>
  );
}