// app/(main)/chat/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function ChatList() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: meData } = await supabase.auth.getUser();
      const myId = meData?.user?.id;
      if (!myId) return;

      // join matches -> find other profile
      const { data } = await supabase
        .from("conversations")
        .select("id, match_id, matches ( user_a, user_b ), matches ( user_a, user_b ), matches ( user_a, user_b ), matches:user_match (user_a, user_b)")
        .limit(100);
      // Above select is placeholder. Simpler approach: query matches where user is involved and join conversation
      const { data: convs } = await supabase
        .from("conversations")
        .select(`
          id,
          match_id,
          match:matches(id, user_a, user_b),
          messages ( id, message, created_at, sender_id )
        `)
        .order("created_at", { foreignTable: "messages", ascending: false });
      // Filter only relevant matches for this user
      const myConvs = (convs || []).filter((c: any) => c.match.user_a === myId || c.match.user_b === myId);
      setConversations(myConvs);
    } catch (err) {
      console.error("fetchConversations", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#ec4899" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={conversations}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          // determine other user id
          const { match } = item;
          const { user_a, user_b } = match;
          // get otherId by comparing to current user
          // for simplicity we will show match id and last message snippet
          const lastMessage = (item.messages || []).slice(-1)[0];
          return (
            <TouchableOpacity style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }} onPress={() => router.push({ pathname: "/(main)/chat/[conversationId]", params: { conversationId: item.id } })}>
              <Text style={{ fontWeight: "700" }}>Chat #{item.id.slice(0,6)}</Text>
              {lastMessage ? <Text style={{ color: "#64748b" }} numberOfLines={1}>{lastMessage.message}</Text> : <Text style={{ color: "#94a3b8" }}>No messages yet</Text>}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 24, color: "#64748b" }}>No conversations yet</Text>}
      />
    </View>
  );
}
