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

const SCREEN_WIDTH = Dimensions.get("window").width;

interface User {
  image: string;
  name: string;
  age: number;
  location: string;
  distance: number;
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

  // Card movement
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Like / Nope overlay animations
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 100], [0, 1]),
    transform: [{ scale: interpolate(translateX.value, [0, 100], [0.8, 1.2]) }],
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -100], [0, 1]),
    transform: [{ scale: interpolate(translateX.value, [0, -100], [0.8, 1.2]) }],
  }));

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: user.image }} style={styles.image} />

          {/* Like Overlay */}
          <Animated.View style={[styles.likeOverlay, likeStyle]}>
            <Text style={styles.likeText}>LIKE ❤️</Text>
          </Animated.View>

          {/* Nope Overlay */}
          <Animated.View style={[styles.nopeOverlay, nopeStyle]}>
            <Text style={styles.nopeText}>NOPE ❌</Text>
          </Animated.View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {user.name}, {user.age}
            </Text>
            <Text style={styles.details}>
              {user.location} • {user.distance} km away
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  likeOverlay: {
    position: "absolute",
    top: 60,
    left: 30,
    padding: 10,
    borderWidth: 3,
    borderColor: "#4CAF50",
    borderRadius: 10,
    transform: [{ rotate: "-15deg" }],
  },
  likeText: {
    color: "#4CAF50",
    fontSize: 24,
    fontWeight: "bold",
  },
  nopeOverlay: {
    position: "absolute",
    top: 60,
    right: 30,
    padding: 10,
    borderWidth: 3,
    borderColor: "#F44336",
    borderRadius: 10,
    transform: [{ rotate: "15deg" }],
  },
  nopeText: {
    color: "#F44336",
    fontSize: 24,
    fontWeight: "bold",
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  details: {
    color: "#eee",
    fontSize: 14,
  },
});
