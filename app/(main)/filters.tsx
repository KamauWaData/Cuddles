import React, { useState } from "react";
import { View, Text, TouchableOpacity, Slider, Platform } from "react-native";
import { useRouter } from "expo-router"

export default function Filters() {
    const router = useRouter();
    const [interestedIn, setInterestIn] = useState<"Men"|"Women"|"Both">("Both");
    const [distance, setDistance] = useState(30);
    const [ageRange, setAgeRange] = useState<[number, number]>([20, 35]);
    const [location, setLocation] = useState("Nairobi, Kenya");

    return(
        <View className="flex-1 bg-gray-50 p-5">
            <Text className="text-1 font-bold mb-4">Filters</Text>

            <Text className="text-sm text-gray-600 mb-2">Interested in</Text>
            <View className="flex-row mb-4">
                {["Men", "Women", "Both"].map(opt => (
                    <TouchableOpacity key={opt} onPress={() => setInterestIn(opt as any)}
                    className={`px-4 py-2 mr-2 rounded-full ${interestedIn===opt ? 'bg-pink-500' : 'bg-white'} border`}>
                        <Text className={`${interestedIn===opt ? 'text-white' : 'text-gray-700'}`}>{opt}</Text> 

                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-sm text-gray-600 mt-2">Location</Text>
            <TouchableOpacity className="py-3 px-4 bg-white rounded-lg border mt-2">
                <Text className="text-gray-700">{location}</Text>
            </TouchableOpacity>

            <Text className="text-sm text-gray-600 mt-4">Distance: {distance}</Text>
            <View className="mt-2 mb-4">
                <Slider 
                    value={distance}
                    minimumValue={1}
                    onValueChange={(v) => setDistance(Math.round(v))}
                />
            </View>
            <Text className="text-sm text-gray-600">Age range: {ageRange[0]} - {ageRange[1]}</Text>

            <View className="flex-row space-x-3 mt-2">
                <TouchableOpacity onPress={() => setAgeRange([18,25])} className={`px-3
                py-2 rounded ${ageRange[0]===18 ? 'bg-pink-500 text-white' : 'bg-white'}`}><Text className={`${ageRange[0]===18 ? 'text-white' :
                'text-gray-700'}`}>18-25</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setAgeRange([26,35])} className={`px-3
                py-2 rounded ${ageRange[0]===26 ? 'bg-pink-500' : 'bg-white'}`}><Text className={`${ageRange[0]===26 ? 'text-white' :
                'text-gray-700'}`}>26-35</Text>
                 </TouchableOpacity>

                 <TouchableOpacity onPress={() => setAgeRange([36,99])} className={`px-3
                py-2 rounded ${ageRange[0]===36 ? 'bg-pink-500' : 'bg-white'}`}><Text className={`${ageRange[0]===36 ? 'text-white' :
                'text-gray-700'}`}>36+</Text>
                </TouchableOpacity>
                </View>

                 <TouchableOpacity onPress={() => router.back()} className="mt-6
                bg-pink-500 py-3 rounded-lg"><Text className="text-white text-center font-semibold">Apply
                Filters</Text>
                </TouchableOpacity>
                 
            </View>    
    )
}