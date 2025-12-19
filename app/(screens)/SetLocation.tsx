// /app/SetLocationScreen.js (Modified)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StaticMapPreview from '../../components/StaticMapPreview';
import { supabase } from '../../lib/supabase';

interface LocationType {
    latitude: number;
    longitude: number;
}

export default function SetLocationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); // 🚨 Get parameters passed from MapPickerScreen
    
    const [location, setLocation] = useState<LocationType | null>(null);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    // 🚨 1. Watch for the returned location from the MapPickerScreen
    useEffect(() => {
        if (params.pickedLocation) {
            try {
                const pickedLoc = JSON.parse(params.pickedLocation as string) as LocationType;
                setLocation(pickedLoc);
                // After setting, remove the parameter so the effect doesn't re-run unexpectedly
                router.setParams({ pickedLocation: undefined }); 
                // Start reverse geocode
                reverseGeocode(pickedLoc);
            } catch (e) {
                console.error("Failed to parse picked location:", e);
            }
        }
    }, [params.pickedLocation]); // Only run when the pickedLocation parameter changes

    // 2. Initial Location/Permission Check (Modified to be more deliberate)
    useEffect(() => {
        const checkInitialLocation = async () => {
            setLoading(true);
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const currentPos = await Location.getCurrentPositionAsync({});
                    const loc = { latitude: currentPos.coords.latitude, longitude: currentPos.coords.longitude };
                    // Only set initial location if none has been picked yet
                    if (!location) {
                        setLocation(loc);
                        reverseGeocode(loc);
                    }
                }
            } catch (error) {
                 console.error("Error getting initial location:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!location) {
            checkInitialLocation();
        }
    }, []); 

    // Open Map Picker
    const openMapPicker = () => {
        router.push("/MapPickerScreen");
    };

    // Reverse Geocode to get address string (No change needed here, but ensure API key is set)
    const reverseGeocode = async (loc: LocationType) => {
        if (!loc) return;
        setAddress("Fetching address...");
        try {
            // Note: This still uses the Google API Key, as it's the most reliable reverse geocoding source.
            // If you need a fully API-key-free solution, you would need to use a service like Nominatim (OSM's geocoder), 
            // but it requires careful attribution and may be rate-limited.
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                 setAddress("Reverse geocoding not configured (Missing API key)");
                 return;
            }
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.latitude},${loc.longitude}&key=${apiKey}`;
            const response = await fetch(url);
            const json = await response.json();
            if (json.status === "OK" && json.results.length > 0) {
                setAddress(json.results[0].formatted_address);
            } else {
                setAddress("Address not found.");
            }
        } catch {
            setAddress("Failed to get address.");
        }
    };

    // Save location to Supabase example
    // SetLocationScreen.js (within the saveLocation function)

// Save location to Supabase example
  const saveLocation = async () => {
      if (!location) {
          Alert.alert("Action Required", "Please select a location first.");
          return;
      }
      setLoading(true);

      // 🚨 FIX: Await the promise returned by supabase.auth.getUser()
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data.user;

      if (userError || !user) {
          Alert.alert("Authentication Error", "You must be logged in to save your profile.");
          setLoading(false);
          return;
      }

      // Use the retrieved user object
      const { error: updateError } = await supabase
          .from("profiles")
          .update({
              latitude: location.latitude,
              longitude: location.longitude,
              address, 
          })
          .eq("id", user.id); // Use user.id here

      setLoading(false);

      if (updateError) {
          console.error("Supabase update error:", updateError);
          Alert.alert("Error", "Failed to save location. Check console for details.");
      } else {
          Alert.alert("Success", "Location saved!");
      }
  };

  return (
    <LinearGradient colors={['#FFF0F5', '#FFFFFF', '#FFF5F7']} style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Set Location</Text>
            <Text style={styles.headerSubtitle}>Pin your location on the map</Text>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapSection}>
          <TouchableOpacity
            onPress={openMapPicker}
            activeOpacity={0.9}
            style={styles.mapContainer}
          >
            {loading ? (
              <View style={styles.mapPlaceholder}>
                <ActivityIndicator size="large" color="#FF3366" />
                <Text style={styles.placeholderText}>Getting GPS location...</Text>
              </View>
            ) : location ? (
              <StaticMapPreview lat={location.latitude} lng={location.longitude} />
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color="#FFB4C1" />
                <Text style={styles.placeholderText}>Tap to select location</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        {location && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Coordinates</Text>
                <Text style={styles.infoValue}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
              </View>
            </View>

            {address && (
              <View style={[styles.infoRow, { marginTop: 12 }]}>
                <Ionicons name="location" size={20} color="#FF3366" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{address}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={openMapPicker}
            style={[styles.secondaryButton, loading && { opacity: 0.6 }]}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="map" size={18} color="#FF3366" />
            <Text style={styles.secondaryButtonText}>Change Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveLocation}
            disabled={loading || !location}
            style={[
              styles.primaryButton,
              (loading || !location) && { opacity: 0.6 },
            ]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF3366', '#FF6B8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>Save Location</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  mapSection: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFE4E6',
  },
  secondaryButtonText: {
    color: '#FF3366',
    fontWeight: '700',
    fontSize: 15,
  },
});
