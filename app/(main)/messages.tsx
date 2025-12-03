// app/(main)/messages.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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

      const { data: convs } = await supabase
        .from("conversations")
        .select(`
          id,
          match_id,
          match:matches(id, user_a, user_b),
          messages ( id, message, created_at, sender_id )
        `)
        .order("created_at", { foreignTable: "messages", ascending: false });

      const myConvs = (convs || []).filter((c: any) => c.match && (c.match.user_a === myId || c.match.user_b === myId));
      setConversations(myConvs);
    } catch (err) {
      console.error("fetchConversations", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#FFF0F5", "#FFFFFF"]} style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#FFF0F5", "#FFFFFF", "#FFF5F7"]} style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</Text>
        </View>

        {/* Conversations List */}
        <FlatList
          data={conversations}
          keyExtractor={(i) => i.id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const lastMessage = (item.messages || []).slice(-1)[0];
            const messagePreview = lastMessage?.message || "No messages yet";
            const messageTime = lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleDateString() : "";

            return (
              <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => router.push({ pathname: "/(main)/chat/[conversationId]", params: { conversationId: item.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="chatbubble" size={24} color="#FF3366" />
                  </View>
                </View>

                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.conversationName}>
                      Match #{item.id.slice(0, 6).toUpperCase()}
                    </Text>
                    <Text style={styles.messageTime}>{messageTime}</Text>
                  </View>
                  <Text
                    style={[
                      styles.messagePreview,
                      !lastMessage && styles.noMessagePreview
                    ]}
                    numberOfLines={1}
                  >
                    {messagePreview}
                  </Text>
                </View>

                <View style={styles.chevron}>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#FF3366" />
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Start chatting with your matches to see conversations here</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFE4E6",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  messageTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  messagePreview: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },
  noMessagePreview: {
    color: "#D1D5DB",
    fontStyle: "italic",
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
