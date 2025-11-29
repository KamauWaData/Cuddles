// components/CardStack.tsx
import React, { useState } from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";

const SCREEN_W = Dimensions.get("window").width;

export default function CardStack({ items = [], onSwipe }: { items: any[], onSwipe: (id:string, dir:'left'|'right', item:any) => void }) {
  const [index, setIndex] = useState(0);

  const handleSwiped = (dir: 'left'|'right', item: any) => {
    setIndex((i) => Math.min(i + 1, items.length));
    onSwipe(item.id, dir, item);
  };

  if (!items || items.length === 0) {
    return <Text className="text-gray-500">No profiles nearby</Text>;
  }

  // render up to 3 stacked cards
  const top = items.slice(index, index + 3);

  return (
    <View style={{ width: SCREEN_W * 0.8, alignItems: "center", justifyContent: "center", marginTop: -20, }}>
      {top.reverse().map((item, idx) => (
        <StackedCard
          key={item.id}
          item={item}
          position={idx}
          onSwipe={(dir) => handleSwiped(dir, item)}
        />
      ))}
    </View>
  );
}

function StackedCard({ item, position, onSwipe }: { item:any, position:number, onSwipe: (dir:'left'|'right')=>void }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rot = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      rot.value = e.translationX / 20;
    })
    .onEnd((e) => {
      const dx = e.translationX;
      const threshold = 120;
      if (Math.abs(dx) > threshold) {
        const dir = dx > 0 ? 'right' : 'left';
        translateX.value = withSpring((dx > 0 ? 1 : -1) * (SCREEN_W * 1.2));
        runOnJS(onSwipe)(dir);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rot.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rot.value}deg` }
    ],
    zIndex: 100 - position
  }));

  const baseStyle = {
    width: SCREEN_W * 0.8,
    height: SCREEN_W * 1.05,
    borderRadius: 18,
    overflow: "hidden" as "hidden",
    position: "absolute",
    alignItems: "flex-start" as const,
    justifyContent: "flex-end" as const,
    backgroundColor: "#fff",
  };

  // slight scale/down offset by position
  const offset = position * 8;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[baseStyle, style, { top: offset, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, elevation: 6 }]}>
        <Image source={{ uri: item.avatar || item.image }} style={{ width: "100%", height: "100%", position: "absolute" }} />
        <View style={{ position: "absolute", left: 16, bottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{item.full_name || `${item.first_name} ${item.last_name}`}</Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>{item.location || `${Math.round(item.distanceKm ?? 0)} km away`}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
