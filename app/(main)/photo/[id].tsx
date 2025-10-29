import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const photos = [
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/women/69.jpg",
    "https://randomuser.me/api/portraits/women/70.jpg",
];

export default function PhotoFull() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const idx = Number(id || 0);

    return (
        <View className="flex-1 bg-black">
            <TouchableOpacity onPress={()=>router.back()} className="absolute top-10
        left-4 z-50 p-2 bg-white rounded-full">
            <Image
        source={{uri:'https://img.icons8.com/ios-filled/50/000000/back.png'}}
        style={{width:20,height:20}}/>
            </TouchableOpacity>

           <Image source={{uri: photos[idx]}} className="w-full h-full"
            resizeMode="cover" /> 

        </View>
    )
}