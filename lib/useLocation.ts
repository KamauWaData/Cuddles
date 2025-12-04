import { useState, useCallback, useEffect } from "react";
import * as Location from "expo-location";
import { supabase } from "./supabase";
import { usePermission } from "./usePermissions";

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationAddress {
  city?: string;
  region?: string;
  country?: string;
  street?: string;
  postalCode?: string;
  name?: string;
}

interface UseLocationOptions {
  autoFetch?: boolean;
  saveToProfile?: boolean;
  onLocationChange?: (location: LocationCoords) => void;
  onError?: (error: Error) => void;
}

interface UseLocationReturn {
  location: LocationCoords | null;
  address: LocationAddress | null;
  loading: boolean;
  error: Error | null;
  permissionGranted: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationCoords | null>;
  fetchLocationAddress: (location: LocationCoords) => Promise<LocationAddress | null>;
  saveLocationToProfile: (location: LocationCoords, address?: LocationAddress) => Promise<void>;
  setCustomLocation: (latitude: number, longitude: number) => Promise<void>;
}

/**
 * Hook to manage user location
 * - Requests permission on demand
 * - Can auto-fetch location on mount
 * - Saves location to profile
 * - Reverse geocodes address
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { autoFetch = false, saveToProfile = true, onLocationChange, onError } = options;

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState<LocationAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const locationPermission = usePermission("location");

  const fetchLocationAddress = useCallback(
    async (coords: LocationCoords): Promise<LocationAddress | null> => {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (results && results.length > 0) {
          const result = results[0];
          return {
            city: result.city,
            region: result.region,
            country: result.country,
            street: result.street,
            postalCode: result.postalCode,
            name: result.name,
          };
        }

        return null;
      } catch (err) {
        console.error("Reverse geocode error:", err);
        return null;
      }
    },
    []
  );

  const getCurrentLocation = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      setLoading(true);
      setError(null);

      // Request permission if not already granted
      if (!locationPermission.granted) {
        const granted = await locationPermission.request();
        if (!granted) {
          const err = new Error("Location permission not granted");
          setError(err);
          onError?.(err);
          return null;
        }
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        maximumAge: 10000,
      });

      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };

      setLocation(coords);
      onLocationChange?.(coords);

      // Fetch reverse geocoded address
      const addr = await fetchLocationAddress(coords);
      setAddress(addr);

      return coords;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to get location");
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [locationPermission, fetchLocationAddress, onLocationChange, onError]);

  const saveLocationToProfile = useCallback(
    async (coords: LocationCoords, addr?: LocationAddress): Promise<void> => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user?.id) {
          throw new Error("User not authenticated");
        }

        // Reverse geocode if address not provided
        let finalAddress = addr;
        if (!finalAddress) {
          finalAddress = await fetchLocationAddress(coords);
        }

        // Build location string
        const locationString =
          finalAddress?.city && finalAddress?.region
            ? `${finalAddress.city}, ${finalAddress.region}`
            : finalAddress?.city ?? "Location not found";

        // Save to profiles table
        const { error } = await supabase.from("profiles").upsert(
          {
            id: authData.user.id,
            latitude: coords.latitude,
            longitude: coords.longitude,
            location: locationString,
          },
          { onConflict: "id" }
        );

        if (error) {
          throw error;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to save location");
        setError(error);
        onError?.(error);
      }
    },
    [fetchLocationAddress, onError]
  );

  const setCustomLocation = useCallback(
    async (latitude: number, longitude: number): Promise<void> => {
      try {
        setLoading(true);
        const coords: LocationCoords = { latitude, longitude };
        setLocation(coords);

        const addr = await fetchLocationAddress(coords);
        setAddress(addr);

        if (saveToProfile) {
          await saveLocationToProfile(coords, addr);
        }

        onLocationChange?.(coords);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to set location");
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchLocationAddress, saveToProfile, saveLocationToProfile, onLocationChange, onError]
  );

  // Auto-fetch location on mount if enabled
  useEffect(() => {
    if (autoFetch && locationPermission.granted) {
      getCurrentLocation();
    }
  }, [autoFetch, locationPermission.granted, getCurrentLocation]);

  return {
    location,
    address,
    loading,
    error,
    permissionGranted: locationPermission.granted,
    requestLocationPermission: locationPermission.request,
    getCurrentLocation,
    fetchLocationAddress,
    saveLocationToProfile,
    setCustomLocation,
  };
}
