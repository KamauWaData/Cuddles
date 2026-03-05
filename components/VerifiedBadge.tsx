import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VerifiedBadgeProps {
  isVerified: boolean;
  status?: "verified" | "pending" | "rejected";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

export default function VerifiedBadge({
  isVerified,
  status = "verified",
  size = "medium",
  style,
}: VerifiedBadgeProps) {
  if (!isVerified && status !== "verified") {
    return null;
  }

  const sizeConfig = {
    small: {
      container: styles.containerSmall,
      icon: 16,
      text: 11,
    },
    medium: {
      container: styles.containerMedium,
      icon: 18,
      text: 13,
    },
    large: {
      container: styles.containerLarge,
      icon: 22,
      text: 15,
    },
  };

  const config = sizeConfig[size];
  let bgColor = "#10B981"; // verified
  let borderColor = "#D1FAE5";
  let textColor = "#065F46";
  let icon: keyof typeof Ionicons.glyphMap = "checkmark-circle";

  if (status === "pending") {
    bgColor = "#F59E0B";
    borderColor = "#FEF3C7";
    textColor = "#78350F";
    icon = "hourglass";
  } else if (status === "rejected") {
    bgColor = "#EF4444";
    borderColor = "#FEE2E2";
    textColor = "#7F1D1D";
    icon = "close-circle";
  }

  return (
    <View
      style={[
        config.container,
        {
          backgroundColor: bgColor + "20",
          borderColor: borderColor,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={config.icon} color={bgColor} />
      <Text style={[styles.text, { color: textColor, fontSize: config.text }]}>
        {status === "verified" ? "Verified" : status === "pending" ? "Pending" : "Rejected"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  containerSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  containerMedium: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  containerLarge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
  },
});
