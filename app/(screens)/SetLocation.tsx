import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useLocationPermission } from '../../components/usePermissions';

export default function SetLocationScreen({ onLocationSet }: { onLocationSet?: (coords: { latitude: number, longitude: number }) => void }) {
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const requestLocationPermission = useLocationPermission();

  const handleGetLocation = async () => {
    setLoading(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) { setLoading(false); return; }
    try {
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      if (onLocationSet) onLocationSet({ latitude: coords.latitude, longitude: coords.longitude });
      Alert.alert('Location set!', `Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
    } catch (err) {
      Alert.alert('Error', 'Could not get location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Set Your Location</Text>
      <TouchableOpacity
        onPress={handleGetLocation}
        className="bg-pink-500 px-6 py-3 rounded-lg mb-4"
        disabled={loading}
        activeOpacity={loading ? 1 : 0.8}
      >
        <Text className="text-white font-bold text-lg">{loading ? 'Locating...' : 'Use My Current Location'}</Text>
      </TouchableOpacity>
      {location && (
        <Text className="text-gray-700">Lat: {location.latitude}, Lng: {location.longitude}</Text>
      )}
      {/* TODO: Add map picker and address search here */}
    </View>
  );
}
