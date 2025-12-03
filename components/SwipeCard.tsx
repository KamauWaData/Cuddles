import React from "react";
import { View, Text, Image, Dimensions, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface User {
  image: string;
  name: string;
  age: number;
  location: string;
  distance: number;
  bio?: string;
  interests?: string[];
}

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 120) {
        const direction = event.translationX > 0 ? "right" : "left";
        runOnJS(onSwipe)(direction);
        translateX.value = withSpring(
          direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5
        );
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 100], [0, 1]),
    transform: [{ scale: interpolate(translateX.value, [0, 100], [0.8, 1.1]) }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -100], [0, 1]),
    transform: [{ scale: interpolate(translateX.value, [0, -100], [0.8, 1.1]) }],
  }));

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: user.image }} style={styles.image} resizeMode="cover" />

          <Animated.View style={[styles.likeOverlay, likeStyle]}>
            <View style={styles.likeContainer}>
              <Ionicons name="heart" size={32} color="#4ADE80" />
              <Text style={styles.likeText}>LIKE</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.nopeOverlay, nopeStyle]}>
            <View style={styles.nopeContainer}>
              <Ionicons name="close" size={32} color="#FF6B6B" />
              <Text style={styles.nopeText}>NOPE</Text>
            </View>
          </Animated.View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View style={styles.infoContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.age}>{user.age}</Text>
              </View>
              
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                <Text style={styles.location}>{user.location}</Text>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distance}>{user.distance} km</Text>
                </View>
              </View>

              {user.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {user.bio}
                </Text>
              )}

              {user.interests && user.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  {user.interests.slice(0, 3).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
  },
  likeOverlay: {
    position: "absolute",
    top: 40,
    left: 24,
    zIndex: 10,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#4ADE80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  likeText: {
    color: "#4ADE80",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  nopeOverlay: {
    position: "absolute",
    top: 40,
    right: 24,
    zIndex: 10,
  },
  nopeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nopeText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  infoContainer: {
    padding: 20,
    paddingBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  age: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "500",
    opacity: 0.9,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  location: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  distanceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  distance: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  bio: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "rgba(255, 51, 102, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
