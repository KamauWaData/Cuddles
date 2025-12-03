import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const mock = [
{ id: "1", name: "Aisha", age: 24, image:
"https://randomuser.me/api/portraits/women/44.jpg" },

{ id: "2", name: "Rachel", age: 26, image:
"https://randomuser.me/api/portraits/women/47.jpg" },

{ id: "3", name: "Maya", age: 22, image:
"https://randomuser.me/api/portraits/women/55.jpg" },

];

export default function Matches() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold mb-4">Matches</Text>

            <FlatList
                data={mock}
                numColumns={2}
                keyExtractor={(i)=> i.id}
                renderItem={({item})=>(
                    <TouchableOpacity onPress={()=>router.push({ pathname: `/
                    (tabs)/profile/${item.id}`.replace(' / (tabs)','/(tabs') })} className="w-1/2
                    p-2">
                    <View className="bg-white rounded-lg overflow-hidden">
                    <Image source={{uri:item.image}} className="w-full h-40" />
                    <View className="p-3">
                    <Text className="text-lg font-semibold">{item.name},
                        {item.age}</Text>
                    <Text className="text-sm text-gray-500">Liked you</Text>
                    </View>    
                    </View>                        
                    </TouchableOpacity>
                )}
                />
        </View>
    );
}