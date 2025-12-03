import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";

export default function Filters() {
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(99);
    const [distance, setDistance] = useState(50);
    const [genderFilter, setGenderFilter] = useState<string[]>(["Man", "Woman"]);

    const toggleGender = (g: string) => {
        setGenderFilter((prev) =>
            prev.includes(g) ? prev.filter((i) => i !== g) : [...prev, g]
        );
    };

    const applyFilters = () => {
        router.push({
            pathname: "/(main)/home",
            params: {
                minAge,
                maxAge,
                distance,
                gender: JSON.stringify(genderFilter),
            },
        });
    };

    return (
        <View className="flex-1 p-6 bg-white">
        <Text className="text-2xl font-bold mb-6">Filters</Text>

        {/* Age Range */}
        <Text className="font-semibold mb-2">Age Range: {minAge} - {maxAge}</Text>

        <Slider value={minAge} minimumValue={18} maximumValue={60} onValueChange={(v: number) => setMinAge(Math.round(v))} />
        <Slider value={maxAge} minimumValue={18} maximumValue={99} onValueChange={(v: number) => setMaxAge(Math.round(v))} />

        {/* Distance */}
        <Text className="font-semibold mt-6">Distance: {distance} km</Text>
        <Slider value={distance} minimumValue={5} maximumValue={200} onValueChange={(v: number) => setDistance(Math.round(v))} />

        {/* Gender */}
        <Text className="font-semibold mt-6">Show Me</Text>
        <View className="flex-row space-x-2 mt-2">
            {["Man", "Woman"].map((g) => (
            <TouchableOpacity
                key={g}
                onPress={() => toggleGender(g)}
                className={`px-4 py-2 rounded-full border ${
                genderFilter.includes(g) ? "bg-pink-500 border-pink-500" : "border-gray-300"
                }`}
            >
                <Text className={genderFilter.includes(g) ? "text-white" : "text-gray-800"}>{g}</Text>
            </TouchableOpacity>
            ))}
        </View>

        {/* Apply Button */}
        <TouchableOpacity
            onPress={applyFilters}
            className="bg-pink-500 p-4 rounded-lg mt-10"
        >
            <Text className="text-white text-center font-bold">Apply Filters</Text>
        </TouchableOpacity>
        </View>
  );
}