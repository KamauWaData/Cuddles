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

export function useLocationPermission() {
  return async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Needed",
        "We need access to your location to show nearby matches."
      );
      return false;
    }
    return true;
  };
}

export function useGalleryPermission() {
  return async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Needed",
        "We need access to your photos for your profile gallery."
      );
      return false;
    }
    return true;
  };
}

