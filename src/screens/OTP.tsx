{/* eslint-disable react-native/no-inline-styles 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { db } from '../firebase/config'; // make sure you export `db` from config
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation'; // adjust path if needed

type OTPScreenRouteProp = RouteProp<RootStackParamList, 'ProfileName'>;
type OTPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTP'>;


export default function OTP() {
  const [code, setCode] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'OTP'>>();
  const route = useRoute();
  //const navigation = useNavigation<OTPScreenNavigationProp>();
  //const route = useRoute<OTPScreenRouteProp>();

  const { confirmation, phoneNumber, name, password, email } = route.params as RootStackParamList['OTP'];

  const handleVerifyCode = async () => {
    try {
      // Confirm the code
      const userCredential = await confirmation.confirm(code);
      const { uid } = userCredential.user;

      // Save user to Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        phone: phoneNumber,
        password,
        email,
        createdAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Phone number verified and user created!');
      navigation.navigate('ProfileName', { uid: userCredential.user.uid }); // Pass required params
    } catch (error: any) {
      console.log('OTP verify error:', error);
      Alert.alert('Invalid code', error.message || 'Please try again');
    }
  };

  return (
  <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#fff' }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Enter OTP</Text>
  <Text style={{ textAlign: 'center', marginBottom: 16 }}>Code sent to {phoneNumber}</Text>
      <TextInput
        placeholder="123456"
        onChangeText={setCode}
        value={code}
        keyboardType="number-pad"
        style={{ borderWidth: 1, padding: 16, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}
        maxLength={6}
      />
      <TouchableOpacity
        onPress={handleVerifyCode}
        style={{ backgroundColor: '#ec4899', padding: 16, borderRadius: 8 }}
      >
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600' }}>Verify Code</Text>
      </TouchableOpacity>
    </View>
  );
}
*/}