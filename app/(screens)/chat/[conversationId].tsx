// app/(main)/chat/[conversationId].tsx
import React, { useEffect, useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, FlatList, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatRef = useRef<any>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      setMessages(data || []);
      // subscribe to changes
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => setMessages((p) => [...p, payload.new])
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    };

    fetchMessages();
  }, [conversationId]);

  const send = async () => {
    if (!text.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: userId, message: text.trim() });
    setText("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <FlatList ref={flatRef} data={messages} keyExtractor={(m) => m.id} renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text>{item.message}</Text>
          <Text style={{ fontSize: 11, color: "#666" }}>{new Date(item.created_at).toLocaleTimeString()}</Text>
        </View>
      )} />
      <View style={{ flexDirection: "row", padding: 10 }}>
        <TextInput value={text} onChangeText={setText} style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12 }} placeholder="Message..." />
        <TouchableOpacity onPress={send} style={{ marginLeft: 8, backgroundColor: "#ec4899", padding: 12, borderRadius: 20 }}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
