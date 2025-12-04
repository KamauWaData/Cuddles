import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export function useCameraPermission() {
  return useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return false;
    }
    return true;
  }, []);
}

export function useGalleryPermission() {
  return useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery access is needed to select photos.');
      return false;
    }
    return true;
  }, []);
}

export function useLocationPermission() {
  return useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location access is needed for discovery features.');
      return false;
    }
    return true;
  }, []);
}
