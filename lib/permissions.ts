import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { Platform, Alert } from "react-native";

export type PermissionType = "camera" | "gallery" | "location";
export type PermissionStatus = "granted" | "denied" | "undetermined";

interface PermissionResult {
  status: PermissionStatus;
  granted: boolean;
  canAskAgain?: boolean;
}

/**
 * Request camera permission (on-demand)
 * iOS: Camera
 * Android: CAMERA
 */
export async function requestCameraPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    return {
      status: status as PermissionStatus,
      granted: status === "granted",
      canAskAgain,
    };
  } catch (error) {
    console.error("Camera permission error:", error);
    return { status: "denied", granted: false };
  }
}

/**
 * Request gallery/photo library permission (on-demand)
 * iOS: Photo Library
 * Android: READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES
 */
export async function requestGalleryPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return {
      status: status as PermissionStatus,
      granted: status === "granted",
      canAskAgain,
    };
  } catch (error) {
    console.error("Gallery permission error:", error);
    return { status: "denied", granted: false };
  }
}

/**
 * Request foreground location permission (on-demand)
 * iOS: NSLocationWhenInUseUsageDescription (Info.plist)
 * Android: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    return {
      status: status as PermissionStatus,
      granted: status === "granted",
      canAskAgain,
    };
  } catch (error) {
    console.error("Location permission error:", error);
    return { status: "denied", granted: false };
  }
}

/**
 * Request background location permission (optional, requires foreground first)
 * iOS: NSLocationAlwaysAndWhenInUseUsageDescription (Info.plist)
 * Android: ACCESS_BACKGROUND_LOCATION
 */
export async function requestBackgroundLocationPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();
    return {
      status: status as PermissionStatus,
      granted: status === "granted",
      canAskAgain,
    };
  } catch (error) {
    console.error("Background location permission error:", error);
    return { status: "denied", granted: false };
  }
}

/**
 * Check current permission status without requesting
 */
export async function checkPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
  try {
    switch (type) {
      case "camera": {
        const { status } = await ImagePicker.getCameraPermissionsAsync();
        return status as PermissionStatus;
      }
      case "gallery": {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        return status as PermissionStatus;
      }
      case "location": {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status as PermissionStatus;
      }
      default:
        return "undetermined";
    }
  } catch (error) {
    console.error(`Check permission status error for ${type}:`, error);
    return "undetermined";
  }
}

/**
 * Request permission with user-friendly alert if denied
 */
export async function requestPermissionWithAlert(
  type: PermissionType,
  requestMessage?: string
): Promise<boolean> {
  const permission = await requestPermission(type);

  if (!permission.granted) {
    const messages = {
      camera: {
        title: "Camera Access Required",
        message:
          requestMessage ??
          "We need camera access to let you take photos. Please enable it in Settings.",
      },
      gallery: {
        title: "Gallery Access Required",
        message:
          requestMessage ??
          "We need access to your photos. Please enable it in Settings.",
      },
      location: {
        title: "Location Access Required",
        message:
          requestMessage ??
          "We need your location to show you nearby matches. Please enable it in Settings.",
      },
    };

    const msg = messages[type];

    Alert.alert(msg.title, msg.message, [{ text: "OK" }]);
  }

  return permission.granted;
}

/**
 * Generic permission request (choose type)
 */
export async function requestPermission(type: PermissionType): Promise<PermissionResult> {
  switch (type) {
    case "camera":
      return requestCameraPermission();
    case "gallery":
      return requestGalleryPermission();
    case "location":
      return requestLocationPermission();
    default:
      return { status: "denied", granted: false };
  }
}

/**
 * Open app settings on iOS/Android
 * (User can manually enable permissions)
 */
export async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      // iOS: Open app settings
      const { Linking } = require("react-native");
      await Linking.openSettings?.();
    } else if (Platform.OS === "android") {
      // Android: Open app settings
      const { Linking } = require("react-native");
      await Linking.openSettings?.();
    }
  } catch (error) {
    console.error("Open settings error:", error);
  }
}

/**
 * Check if we can ask again after denial
 * (On iOS 14+, once "Don't Ask Again" is selected, canAskAgain becomes false)
 */
export async function canRequestPermissionAgain(type: PermissionType): Promise<boolean> {
  const result = await checkPermissionStatus(type);
  if (result === "denied") {
    const permission = await requestPermission(type);
    return permission.canAskAgain ?? false;
  }
  return true;
}
