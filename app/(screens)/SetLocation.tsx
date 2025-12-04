import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { useLocation } from "../lib/useLocation";
import MapView, { Marker } from "react-native-maps";

export default function SetLocationScreen() {
  const router = useRouter();
  const {
    location,
    address,
    loading,
    error,
    permissionGranted,
    requestLocationPermission,
    getCurrentLocation,
    saveLocationToProfile,
    setCustomLocation,
  } = useLocation({ autoFetch: false, saveToProfile: false });

  const [customCity, setCustomCity] = useState<string>("");
  const [customRegion, setCustomRegion] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (location) {
      setSelectedLocation({ lat: location.latitude, lon: location.longitude });
    }
  }, [location]);

  const handleUseCurrentLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert("Permission Denied", "Location permission is required to use your current location.");
      return;
    }

    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setSelectedLocation({
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      });
    }
  };

  const handleSearchLocation = async () => {
    if (!customCity.trim()) {
      Alert.alert("Enter City", "Please enter a city name to search.");
      return;
    }

    setSearching(true);
    try {
      const query = customRegion.trim()
        ? `${customCity}, ${customRegion}`
        : customCity;

      const results = await Location.geocodeAsync(query);

      if (results && results.length > 0) {
        const firstResult = results[0];
        setSelectedLocation({
          lat: firstResult.latitude,
          lon: firstResult.longitude,
        });
        Alert.alert("Location Found", `Setting location to ${query}`);
      } else {
        Alert.alert("Not Found", `No location found for "${query}".`);
      }
    } catch (err) {
      console.error("Geocode error:", err);
      Alert.alert("Search Error", "Failed to search for location.");
    } finally {
      setSearching(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert("No Location", "Please select or search for a location.");
      return;
    }

    try {
      await setCustomLocation(selectedLocation.lat, selectedLocation.lon);
      Alert.alert("Success", "Location saved successfully!");
      router.back();
    } catch (err) {
      console.error("Save location error:", err);
      Alert.alert("Error", "Failed to save location.");
    }
  };

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FF3366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Location Info */}
          {address && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#FF3366" />
                <Text style={styles.sectionTitle}>Current Location</Text>
              </View>
              <View style={styles.locationCard}>
                <Text style={styles.locationCardText}>
                  {address.city && address.region
                    ? `${address.city}, ${address.region}`
                    : address.name ?? "Location Details"}
                </Text>
                {address.country && (
                  <Text style={styles.locationCardSubtext}>{address.country}</Text>
                )}
              </View>
            </View>
          )}

          {/* Use Current Location Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={["#ff69b4", "#ff1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="locate" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Use Current Location</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Or Divider */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Search Location */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="search" size={20} color="#FF3366" />
              <Text style={styles.sectionTitle}>Search Location</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., New York"
                value={customCity}
                onChangeText={setCustomCity}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State/Region (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., New York"
                value={customRegion}
                onChangeText={setCustomRegion}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchLocation}
              activeOpacity={0.8}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#FF3366" size="small" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#FF3366" />
                  <Text style={styles.searchButtonText}>Search Location</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Selected Location Display */}
          {selectedLocation && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>Selected Location</Text>
              </View>
              <View style={styles.selectedLocationCard}>
                <Text style={styles.selectedLocationText}>
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                </Text>
                <Text style={styles.selectedLocationSubtext}>
                  Latitude: {selectedLocation.lat.toFixed(6)}
                </Text>
                <Text style={styles.selectedLocationSubtext}>
                  Longitude: {selectedLocation.lon.toFixed(6)}
                </Text>
              </View>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer: Save Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveLocation}
            activeOpacity={0.85}
            disabled={!selectedLocation || loading}
          >
            <LinearGradient
              colors={["#ff69b4", "#ff1493"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Location</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3366",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  locationCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  locationCardSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  currentLocationButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  orText: {
    marginHorizontal: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1F2937",
  },
  searchButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFE4E6",
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonText: {
    color: "#FF3366",
    fontWeight: "700",
    fontSize: 16,
  },
  selectedLocationCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  selectedLocationSubtext: {
    fontSize: 13,
    color: "#059669",
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontWeight: "500",
    fontSize: 14,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF3366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
  },
});
