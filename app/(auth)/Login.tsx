import React, { useEffect, useState } from 'react';
import { View, Text, Alert,TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import TextInputField from '../../components/TextInputField';
import PrimaryButton from '../../components/PrimaryButton';
import {useSession} from '../../lib/useSession';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {session} = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('LoginScreen mounted');
  }, []);

  const isValidEmail = (e: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleLogin = async () => {
    console.log('handleLogin', { email });
    const e = email.trim();
    if (!isValidEmail(e)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }

    if (!isValidEmail(e)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
      }
    
    setLoading(true)
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        className="bg-white"
      >
      <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 15, color: '#1F41BB', textAlign: 'center', fontFamily: 'poppins' }}>Login Here</Text>
      <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 90, textAlign: 'center', fontFamily: 'poppins' }}>
        Welcome Back{session?.user?.user_metadata?.name ? ` ${session.user.user_metadata.name}` : ''}
      </Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        style={{ borderWidth: 2,  padding: 10, marginBottom: 10, borderColor: '#1F41BB', borderRadius: 8 }}
      /> 
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{ borderWidth: 2, padding: 10, marginBottom: 10, borderColor: '#1F41BB', borderRadius: 8 }}
      />
      <Text
        style={{ textAlign: 'right', fontWeight: 'bold', marginTop: 20, color: '#1F41BB' }}
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        Forgot Password? 
      </Text>

      <PrimaryButton text="Login" onPress={handleLogin} />
      
      <Text
        style={{ textAlign: 'center', marginTop: 20, fontFamily: 'poppins', fontWeight: 'bold' }}
        onPress={() => router.push('/(auth)/register')}
      >
        Don’t have an account? 
      <Text style={{ textAlign: 'center', marginTop: 20, fontWeight: 'bold', fontFamily: 'poppins', color: '#1F41BB', }}> Register</Text>
      </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}