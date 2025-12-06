import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { MapView, Marker } from "expo-maps";
import * as Location from "expo-location";
import { useLocationPermission } from "../../components/usePermissions";

interface SetLocationScreenProps {
  onLocationSet?: (location: { latitude: number; longitude: number }) => void;
}

export default function SetLocationScreen({ onLocationSet }: SetLocationScreenProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const requestLocationPermission = useLocationPermission();

  const getGpsLocation = async () => {
    setLoading(true);

    const hasPerm = await requestLocationPermission();
    if (!hasPerm) {
      setLoading(false);
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const loc = { latitude: coords.latitude, longitude: coords.longitude };
      setLocation(loc);
      onLocationSet?.(loc);
    } catch (e) {
      Alert.alert("Error", "Unable to get your location.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: any; longitude: any; }; }; }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const loc = { latitude, longitude };
    setLocation(loc);
    onLocationSet?.(loc);
  };

  return (
    <View className="flex-1 bg-white">
      <Text className="text-2xl font-bold text-center mt-8 mb-4">Set Your Location</Text>

      {/* MAP */}
      <View className="flex-1 px-4">
        <MapView
          style={{ flex: 1, borderRadius: 16 }}
          initialRegion={{
            latitude: location?.latitude || -1.286389,
            longitude: location?.longitude || 36.817223,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          onPress={handleMapPress}
        >
          {location && <Marker coordinate={location} />}
        </MapView>
      </View>

      {/* GPS BUTTON */}
      <TouchableOpacity
        className="bg-pink-500 mx-6 py-4 rounded-xl my-6"
        onPress={getGpsLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-center">Use My Current Location</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
