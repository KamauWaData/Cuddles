import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, Alert,  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/navigation';
// Use your supabase client instance (adjust the path if your client file is elsewhere)
import { supabase } from '../supabase/supabaseClient';

type ProfileNameScreenRouteProp = RouteProp<RootStackParamList, 'Gender'>;
type ProfileNameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileName'>;

export default function ProfileName() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ProfileName'>>();
  const route = useRoute();
  const params = route.params as RootStackParamList['ProfileName'] | undefined;
  const uidFromParams = params?.uid;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState('');

  // 📸 Pick & upload avatar
  const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert("Upload cancelled or no image selected");
      return null;
    }

    const file = result.assets[0];

    // 👇🏽 Important: Cloudinary only accepts URI with `file://` or `content://`
    if (!file.uri.startsWith('file://') && !file.uri.startsWith('content://')) {
      Alert.alert('Invalid image source');
      return null;
    }

    const formData = new FormData();

    formData.append('file', {
      uri: file.uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    formData.append('upload_preset', 'my_avatar_preset');

    const CLOUD_NAME = 'dre7tjrrp';

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data', // 🚨 Required in Expo!
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary upload failed", data);
      Alert.alert("Upload failed", data?.error?.message || "Unknown error");
      return null;
    }

    return data.secure_url;

  } catch (err: any) {
    console.error("Upload Error:", err);
    Alert.alert("Upload error", err?.message || "Unknown error");
    return null;
  }
};

    const handleAvatarUpload = async () => {
        const url = await pickImage();
        if (url) {
          setAvatar(url);
        }
      };


      // 📝 Save user profile
      const handleContinue = async () => {
        if (!firstName || !lastName || !birthdate) {
          Alert.alert('Please fill all fields');
          return;
        }

        try {
          // Resolve uid: prefer route param then supabase auth user
          let resolvedUid = uidFromParams;
          if (!resolvedUid) {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
              console.error('Supabase auth error', userError);
              Alert.alert('Authentication error. Please sign in again.');
              return;
            }
            resolvedUid = userData.user.id;
          }

          // Upsert profile into 'users' table (adjust table name/columns if different)
          const { data, error } = await supabase
            .from('users')
            .upsert([{
              id: resolvedUid,
              firstName,
              lastName,
              birthday: birthdate.toISOString().split('T')[0],
              avatar,
              profileComplete: false,
            }]);

          if (error) {
            console.error('Supabase upsert error', error);
            Alert.alert('Error saving profile.');
            return;
          }

          navigation.navigate('Gender', {
            uid: resolvedUid,
            profile: {
              firstName,
              lastName,
              birthdate: birthdate.toISOString().split('T')[0],
              avatar,
            },
          });
        } catch (err) {
          console.error('Profile save error:', err);
          Alert.alert('Error saving profile.');
        }
      };

     return (
    <View className="flex-1 p-6 justify-center bg-white">
  <TouchableOpacity onPress={pickImage} className="self-center mb-4">
        {avatar ? (
          <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48 }} />
        ) : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#6b7280' }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={{ borderWidth: 1, padding: 16, borderRadius: 8, marginBottom: 16 }}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={{ borderWidth: 1, padding: 16, borderRadius: 8, marginBottom: 16 }}
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ borderWidth: 1, padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text>
          {birthdate ? birthdate.toDateString() : 'Choose Birthday'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthdate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setBirthdate(date);
          }}
        />
      )}

      <TouchableOpacity onPress={handleAvatarUpload} className="mb-4 bg-gray-200 rounded p-3">
        <Text className="text-center text-gray-800 font-medium">
          {avatar ? 'Change Photo' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleContinue} className="bg-pink-500 p-4 rounded">
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}