import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import SwipeCard from "../../components/SwipeCard";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const users = [
  {
    id: 1,
    image: "https://i.pravatar.cc/400?img=11",
    name: "Alfredo Calzoni",
    age: 20,
    location: "Hamburg, Germany",
    distance: 16.8,
  },
  {
    id: 2,
    image: "https://i.pravatar.cc/400?img=12",
    name: "Jessica Parker",
    age: 23,
    location: "London, UK",
    distance: 8.2,
  },
  {
    id: 3,
    image: "https://i.pravatar.cc/400?img=13",
    name: "Bruno Kelly",
    age: 25,
    location: "Berlin, Germany",
    distance: 12.4,
  },
];

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"friends" | "partners">("friends");

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") console.log("Liked!");
    else console.log("Disliked!");

    setCurrentIndex((prev) => (prev + 1 < users.length ? prev + 1 : 0));
  };

  const currentUser = users[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-pink-100">
      {/* Top row: left icon and grouped right icons */}
      <View className="flex-row items-center justify-between px-6 mt-6">
        {/* left-aligned */}
        <TouchableOpacity className="rounded-full bg-white shadow p-3">
          <Icon name="person-outline" size={24} color="#FF3366" />
        </TouchableOpacity>

        {/* right-aligned group */}
        <View className="flex-row items-center space-x-3 ">
          <TouchableOpacity className="rounded-full bg-white shadow p-3">
            <Icon name="heart-outline" size={24} color="#FF3366" onPress={() => router.push('(screens)/filters')}/>
          </TouchableOpacity>
          <TouchableOpacity className="rounded-full bg-white shadow p-3">
            <Icon name="filter-outline" size={24} color="#FF3366" onPress={() => router.push('(screens)/filters')}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Deck wrapper: centered, width matches SwipeCard (w-[90%]) */}
      <View className="flex-1 mt-6 items-center">
        <View className="w-[90%] max-h-[480px] bg-white rounded-3xl shadow-lg justify-center items-center overflow-hidden">
          {currentUser && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/(main)/profile/[id]",
                  params: { id: currentUser.id },
                })
              }
              className="w-full h-400"
            >
              <SwipeCard key={currentUser.id} user={currentUser} onSwipe={handleSwipe} />
            </TouchableOpacity>
          )}

          {/* Bottom Buttons (full width of the wrapper, centered) */}
          <View className="w-full flex-row justify-center items-center space-x-6 mb-2 p-4">
            <TouchableOpacity className="bg-white w-14 h-14 rounded-full shadow items-center justify-center">
              <Icon name="close" size={28} color="#FF3366" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-white w-16 h-16 rounded-full shadow items-center justify-center">
              <Icon name="star" size={32} color="#FF3366" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-white w-14 h-14 rounded-full shadow items-center justify-center">
              <Icon name="heart" size={28} color="#FF3366" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}