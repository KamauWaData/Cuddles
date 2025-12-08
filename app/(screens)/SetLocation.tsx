// /app/SetLocationScreen.js (Modified)
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router"; // 🚨 Added useLocalSearchParams
import StaticMapPreview from "../../components/StaticMapPreview"; // Static map component
import { supabase } from "../../lib/supabase"; // Your Supabase client

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
        <View style={styles.container}>
            <Text style={styles.title}>Set Your Location</Text>

            <TouchableOpacity onPress={openMapPicker} activeOpacity={0.8} style={styles.mapContainer}>
                {loading ? (
                    <View style={styles.mapPlaceholder}>
                        <ActivityIndicator size="large" color="#ff4081" />
                        <Text style={{ marginTop: 10 }}>Getting initial GPS...</Text>
                    </View>
                ) : location ? (
                    <StaticMapPreview lat={location.latitude} lng={location.longitude} />
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <Text>Tap to Select Location on Map</Text>
                    </View>
                )}
            </TouchableOpacity>
            
            {location && (
                <Text style={styles.coordinates}>
                    Coordinates: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
            )}

            {address && (
                <Text style={styles.address}>{address}</Text>
            )}

            <TouchableOpacity
                style={[styles.button, (loading || !location) && { opacity: 0.7 }]}
                onPress={saveLocation}
                disabled={loading || !location}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Save Location</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "white" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    mapContainer: { 
        borderRadius: 12,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        width: "100%",
        height: 200,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    coordinates: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    address: { marginTop: 16, fontSize: 16, color: "#444", textAlign: "center", fontWeight: 'bold' },
    button: {
        marginTop: 24,
        backgroundColor: "#ff4081",
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 18, textAlign: "center" },
});