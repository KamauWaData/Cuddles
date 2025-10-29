import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

const conversations = [
    { id: "c1", name: "Grace", last: "How are you?", time: "2:24 PM", avatar:
    "https://randomuser.me/api/portraits/women/65.jpg" },

    { id: "c2", name: "Ben", last: "Let's meet up", time: "12:04 PM", avatar:
    "https://randomuser.me/api/portraits/men/66.jpg" },
];

export default function Messages() {
    const router = useRouter();
    return (
        <View className='flex-1 bg-white p-4'>
            <Text className='text-xl font-bold mb-3'>Messages</Text>
            <FlatList
                data={conversations}
                keyExtractor={i=>i.id}
                renderItem={(item)=>(
                    <TouchableOpacity onPress={()=>router.push(`/
                    (main)/chat/${item.id}`.replace(' / (main)','/(main'))} className="flex-row
                    items-center py-3">
                <Image source={{uri:item.avatar}} className="w-12 h-12 rounded-full mr-3" />

                <View style={{flex:1}}>
                    <Text className="font-semibold">{item.name}</Text>
                    <Text className="text-sm text-gray-500">{item.last}</Text>
                    </View>
                    <Text className="text-xs text-gray-400">{item.time}</Text>
                </TouchableOpacity>
                )}
                />
        </View>
    )
}