import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import Constants from "expo-constants";

export interface NotificationPayload {
  type: "new_like" | "new_match" | "new_message" | "message_read" | "typing";
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Initialize push notifications
 * Call this once on app startup
 */
export async function initializePushNotifications(): Promise<string | null> {
  try {
    // Check if device supports notifications
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return null;
    }

    // Get existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push notification permissions");
      return null;
    }

    // Get push token
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    console.log("Push token:", token);

    // Save token to Supabase
    await saveDeviceToken(token);

    // Configure notification handler
    configureNotificationHandler();

    return token;
  } catch (error) {
    console.error("Initialize push notifications error:", error);
    return null;
  }
}

/**
 * Save device token to Supabase
 */
async function saveDeviceToken(token: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const deviceType = Platform.OS as "ios" | "android" | "web";

    const { error } = await supabase.from("push_notification_tokens").upsert(
      {
        user_id: userId,
        device_token: token,
        device_type: deviceType,
        is_active: true,
      },
      { onConflict: "user_id,device_token" }
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Save device token error:", error);
    return false;
  }
}

/**
 * Configure notification handler
 */
function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });

  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification received (foreground):", notification);
    handleNotificationResponse(notification);
  });

  // Handle notification tap
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("Notification tapped:", response);
      handleNotificationResponse(response.notification);
    }
  );

  // Clean up subscriptions on unmount
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Handle notification response
 */
function handleNotificationResponse(notification: Notifications.Notification): void {
  const { type, data } = notification.request.content.data as NotificationPayload;

  switch (type) {
    case "new_match":
      // Navigate to matches screen
      console.log("New match notification:", data);
      break;
    case "new_message":
      // Navigate to chat screen
      console.log("New message notification:", data);
      break;
    case "new_like":
      // Show alert or navigate
      console.log("New like notification:", data);
      break;
    default:
      console.log("Unknown notification type:", type);
  }
}

/**
 * Send push notification to a user
 * (This would typically be done from your backend)
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Get user's device tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("push_notification_tokens")
      .select("device_token")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (tokensError) throw tokensError;
    if (!tokens || tokens.length === 0) {
      console.log("No active device tokens for user");
      return false;
    }

    // Send notification to each token
    const responses = await Promise.all(
      tokens.map((token) =>
        sendExpoPushNotification(token.device_token, {
          title: payload.title,
          body: payload.body,
          data: { ...payload.data, type: payload.type },
        })
      )
    );

    return responses.every((r) => r);
  } catch (error) {
    console.error("Send push notification error:", error);
    return false;
  }
}

/**
 * Send notification via Expo Push Notification Service
 */
async function sendExpoPushNotification(
  expoPushToken: string,
  notification: {
    title: string;
    body: string;
    data: Record<string, any>;
  }
): Promise<boolean> {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: notification.data,
      badge: 1,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result.data?.success || false;
  } catch (error) {
    console.error("Send Expo push error:", error);
    return false;
  }
}

/**
 * Get user's notification settings
 */
export async function getNotificationSettings() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return null;

    let { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // Create default settings
      const { data: newSettings } = await supabase
        .from("notification_settings")
        .insert({ user_id: userId })
        .select()
        .single();
      return newSettings;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get notification settings error:", error);
    return null;
  }
}

/**
 * Update user's notification settings
 */
export async function updateNotificationSettings(settings: {
  new_likes?: boolean;
  new_matches?: boolean;
  messages?: boolean;
  super_likes?: boolean;
  rewinds?: boolean;
}): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("notification_settings")
      .update(settings)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Update notification settings error:", error);
    return false;
  }
}

/**
 * Deactivate all device tokens when user logs out
 */
export async function deactivateDeviceTokens(): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("push_notification_tokens")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Deactivate device tokens error:", error);
    return false;
  }
}
