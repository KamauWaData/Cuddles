import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, UrlTile, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Initial region defaults to a central point (e.g., Nairobi)
const DEFAULT_REGION = {
    latitude: -1.286389,
    longitude: 36.817223,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

interface LocationType {
    latitude: number;
    longitude: number;
}

export default function MapPickerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(false);

    const getGpsLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission denied", "Location permission is required to use GPS.");
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            const loc = { latitude: coords.latitude, longitude: coords.longitude };
            
            setLocation(loc);
            
            // OPTIONAL: Programmatically move the map to the GPS location
            // mapRef.current?.animateToRegion({ ...loc, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 1000);
            
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to get current GPS location.");
        } finally {
            setLoading(false);
        }
    };

    const onMapPress = (event: MapPressEvent) => {
        const { coordinate } = event.nativeEvent;
        setLocation(coordinate);
    };

    const handleSaveLocation = () => {
        if (!location) {
            Alert.alert("No Location", "Please select a location on the map first.");
            return;
        }

        // 🚨 IMPORTANT: Pass data back using `router.setParams` and then go back.
        // The calling screen (SetLocationScreen) will use `useLocalSearchParams` to read this.
        router.setParams({ 
            pickedLocation: JSON.stringify(location) 
        });
        router.back();
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick Location</Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onPress={onMapPress}
        provider={undefined}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {location && <Marker coordinate={location} />}
      </MapView>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        {location && (
          <View style={styles.coordsCard}>
            <View style={styles.coordsRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.coordsLabel}>Location Selected</Text>
                <Text style={styles.coordsText}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={getGpsLocation}
            style={styles.gpsButton}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="locate" size={18} color="#FFFFFF" />
                <Text style={styles.gpsButtonText}>Use My Location</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveLocation}
            style={[styles.saveButton, !location && { opacity: 0.5 }]}
            disabled={!location}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF3366', '#FF6B8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Confirm Location</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  coordsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coordsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 2,
  },
  buttonGroup: {
    gap: 12,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2196F3',
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
