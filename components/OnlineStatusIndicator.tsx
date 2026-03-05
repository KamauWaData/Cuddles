import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { getLastActiveText, isRecentlyActive } from "../lib/onlineStatus";

interface OnlineStatusIndicatorProps {
  lastActiveAt: string;
  isOnline: boolean;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  showText?: boolean;
}

export default function OnlineStatusIndicator({
  lastActiveAt,
  isOnline,
  size = "medium",
  style,
  showText = false,
}: OnlineStatusIndicatorProps) {
  const recently = isRecentlyActive(lastActiveAt);
  const lastActiveText = getLastActiveText(lastActiveAt);

  const sizeConfig = {
    small: {
      dot: 10,
      textSize: 11,
    },
    medium: {
      dot: 12,
      textSize: 12,
    },
    large: {
      dot: 16,
      textSize: 13,
    },
  };

  const config = sizeConfig[size];

  // Determine color based on online status
  let bgColor = "#6B7280"; // offline
  let statusLabel = "Offline";

  if (isOnline) {
    bgColor = "#10B981"; // online (bright green)
    statusLabel = "Online now";
  } else if (recently) {
    bgColor = "#3B82F6"; // recently active (blue)
    statusLabel = lastActiveText;
  } else {
    statusLabel = lastActiveText;
  }

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          {
            flexDirection: showText ? "row" : "column",
            gap: showText ? 6 : 0,
            alignItems: showText ? "center" : "flex-start",
          },
        ]}
      >
        {/* Dot indicator */}
        <View
          style={[
            styles.dot,
            {
              width: config.dot,
              height: config.dot,
              borderRadius: config.dot / 2,
              backgroundColor: bgColor,
              shadowColor: bgColor,
              shadowOpacity: isOnline || recently ? 0.4 : 0.2,
            },
          ]}
        />

        {/* Status text */}
        {showText && (
          <Text
            style={[
              styles.text,
              {
                fontSize: config.textSize,
                color: bgColor,
              },
            ]}
          >
            {statusLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  dot: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: "600",
  },
});

/**
 * Compact badge version (good for profile cards)
 */
export function OnlineStatusBadge({
  lastActiveAt,
  isOnline,
  size = "small",
}: {
  lastActiveAt: string;
  isOnline: boolean;
  size?: "small" | "medium";
}) {
  const recently = isRecentlyActive(lastActiveAt);
  let bgColor = "#FFFFFF";
  let borderColor = "#E5E7EB";
  let textColor = "#6B7280";
  let label = "Offline";

  if (isOnline) {
    bgColor = "#D1FAE5";
    borderColor = "#10B981";
    textColor = "#065F46";
    label = "Online";
  } else if (recently) {
    bgColor = "#DBEAFE";
    borderColor = "#3B82F6";
    textColor = "#1E40AF";
    label = "Active";
  }

  const fontSize = size === "small" ? 11 : 12;
  const paddingVertical = size === "small" ? 3 : 4;
  const paddingHorizontal = size === "small" ? 7 : 10;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      <Text
        style={{
          fontSize,
          fontWeight: "600",
          color: textColor,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});

// Export badge styles for use in OnlineStatusBadge
Object.assign(styles, badgeStyles);
