import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity,
KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";

const mockMessages = [
    { id: "m1", fromMe: false, text: "Hey! How's your day?" },
    { id: "m2", fromMe: true, text: "It's good — you?" },
];

export default function Chat() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [messages, setMessages] = useState(mockMessages);
    const [text, setText] = useState("");

    const send = () => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), fromMe: true, text}]);
        setText("");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
            <View className="p-4 border-b">
                <Text className="text-lg font-semibold">Chat</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={m=>m.id}
                contentContainerStyle={{ padding: 12}}
                renderItem={({item})=>(
                <View className={`mb-3 ${item.fromMe ? 'items-end' :
                'items-start'}`}>
                    <View className={`${item.fromMe ? 'bg-pink-500 text-white' :
                    'bg-gray-100'} p-3 rounded-lg`}>
                        <Text className={`${item.fromMe ? 'text-white' :
                        'text-gray-800'}`}>{item.text}</Text>
                    </View>
                </View>
                )}
                />
                <View className="flex-row p-3 border-t items-center"><TextInput value={text} onChangeText={setText} placeholder="Message..."
                    className="flex-1 bg-gray-100 p-3 rounded-lg mr-2" /><TouchableOpacity onPress={send} className="bg-pink-500 p-3
                    rounded-full">
                    <Text className="text-white">Send</Text>    
                </TouchableOpacity>
                </View>
        </KeyboardAvoidingView>
    );
}