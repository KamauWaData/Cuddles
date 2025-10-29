import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import SwipeCard from "../../components/SwipeCard";
import Icon from "react-native-vector-icons/Ionicons";

const users = [
  {
    image: "https://i.pravatar.cc/400?img=11",
    name: "Alfredo Calzoni",
    age: 20,
    location: "Hamburg, Germany",
    distance: 16.8,
  },
  {
    image: "https://i.pravatar.cc/400?img=12",
    name: "Jessica Parker",
    age: 23,
    location: "London, UK",
    distance: 8.2,
  },
  {
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
    <View className="flex-1 bg-pink-100">
      {/* Top Segmented Buttons */}
      <View className="flex-row justify-center mt-12 mb-4 space-x-2">
        <TouchableOpacity
          onPress={() => setMode("friends")}
          className={`px-4 py-2 rounded-full ${
            mode === "friends" ? "bg-pink-500" : "bg-white"
          }`}
        >
          <Text
            className={`${
              mode === "friends" ? "text-white" : "text-gray-700"
            } font-semibold`}
          >
            Make Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("partners")}
          className={`px-4 py-2 rounded-full ${
            mode === "partners" ? "bg-pink-500" : "bg-white"
          }`}
        >
          <Text
            className={`${
              mode === "partners" ? "text-white" : "text-gray-700"
            } font-semibold`}
          >
            Search Partners
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipe Deck */}
      <View className="flex-1 justify-center items-center">
      {currentUser && (
        <SwipeCard
          key={currentUser.name}
          user={currentUser}
            onSwipe={handleSwipe}
          />
        )}
      </View>


      {/* Bottom Buttons */}
      <View className="flex-row justify-center items-center mb-10 space-x-6">
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
  );
}
