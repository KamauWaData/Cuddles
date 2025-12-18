// /app/MapPickerScreen.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

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
            <MapView
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                onPress={onMapPress}
                provider={undefined} // Use default, necessary for custom tiles
            >
                {/* OpenStreetMap Tiles via <UrlTile> */}
                <UrlTile
                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
                {location && <Marker coordinate={location} />}
            </MapView>
            
            {/* Display selected coordinates */}
            {location && (
                <Text style={styles.coordsText}>
                    Selected: Lat {location.latitude.toFixed(5)}, Lon {location.longitude.toFixed(5)}
                </Text>
            )}

            <TouchableOpacity
                onPress={getGpsLocation}
                style={[styles.button, styles.gpsButton]}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        Use Current GPS Location
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSaveLocation}
                style={[styles.button, styles.saveButton]}
                disabled={!location}
            >
                <Text style={styles.buttonText}>
                    Save Location
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    coordsText: { textAlign: 'center', marginVertical: 10, fontSize: 14, color: '#333' },
    button: {
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    gpsButton: {
        backgroundColor: "#2196F3", // Blue for GPS
    },
    saveButton: {
        backgroundColor: "#4CAF50", // Green for Save
        marginBottom: 20,
    },
    buttonText: { textAlign: "center", color: "white", fontWeight: "bold", fontSize: 16 },
});