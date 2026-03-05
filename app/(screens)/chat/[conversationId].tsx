import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import {
  sendMessage,
  sendImageMessage,
  markConversationAsRead,
  subscribeToTypingIndicators,
  subscribeToReadReceipts,
  setTypingIndicator,
  removeTypingIndicator,
  ChatMessage,
} from "../../../lib/chatEnhancements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recipient, setRecipient] = useState<any>(null);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        setMyId(auth.user.id);
        fetchRecipient(auth.user.id);
      }
    };
    init();
    fetchMessages();

    // Mark as read on entry
    markConversationAsRead(conversationId);

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;

          if (newMessage.message_type === "image") {
            // Fetch attachment for image messages
            supabase
              .from("message_attachments")
              .select("*")
              .eq("message_id", newMessage.id)
              .single()
              .then(({ data: attachment }) => {
                const messageWithAttachment = { ...newMessage, message_attachments: attachment ? [attachment] : [] };
                setMessages((p) => {
                  if (p.some((m) => m.id === newMessage.id)) {
                    return p.map((m) => m.id === newMessage.id ? messageWithAttachment : m);
                  }
                  return [...p, messageWithAttachment];
                });
              });
          } else {
            setMessages((p) => {
              if (p.some((m) => m.id === newMessage.id)) return p;
              return [...p, newMessage];
            });
          }

          // Mark as read if it's from the other person
          if (newMessage.sender_id !== myId) {
            markConversationAsRead(conversationId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setMessages((p) =>
            p.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    // Subscribe to typing
    const unsubscribeTyping = subscribeToTypingIndicators(conversationId, (users) => {
      setTypingUsers(users.filter((id) => id !== myId));
    });

    // Subscribe to read receipts
    const unsubscribeRead = subscribeToReadReceipts(conversationId, (messageId, userId) => {
      if (userId !== myId) {
        setMessages((p) =>
          p.map((m) => (m.id === messageId ? { ...m, delivery_status: "read", is_read: true } : m))
        );
      }
    });

    return () => {
      supabase.removeChannel(channel);
      unsubscribeTyping();
      unsubscribeRead();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, myId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*, message_attachments(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const fetchRecipient = async (currentUserId: string) => {
    // Get conversation to find the other participant
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("participant1_id, participant2_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conv) return;

    const otherId = conv.participant1_id === currentUserId ? conv.participant2_id : conv.participant1_id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", otherId)
      .single();

    if (profile) {
      setRecipient(profile);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const msg = text.trim();
    setText("");
    removeTypingIndicator(conversationId);
    setIsTyping(false);

    const result = await sendMessage(conversationId, msg);
    if (!result) {
      Alert.alert("Error", "Failed to send message");
    }
    setSending(false);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow gallery access to send photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSending(true);
      const res = await sendImageMessage(conversationId, result.assets[0].uri);
      if (!res) {
        Alert.alert("Error", "Failed to send image");
      }
      setSending(false);
    }
  };

  const handleTyping = (val: string) => {
    setText(val);
    if (!isTyping) {
      setIsTyping(true);
      setTypingIndicator(conversationId);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      removeTypingIndicator(conversationId);
    }, 3000);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === myId;
    const attachment = item.message_attachments?.[0];

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {item.message_type === "image" ? (
            attachment ? (
              <Image source={{ uri: attachment.attachment_url }} style={styles.messageImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="small" color={isMe ? "#fff" : "#FF3366"} />
              </View>
            )
          ) : (
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
              {item.message}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe ? styles.myTime : styles.theirTime]}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            {isMe && (
              <Ionicons
                name={item.delivery_status === "read" ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.delivery_status === "read" ? "#fff" : "#eee"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient colors={["#FF3366", "#FF5E8E"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: recipient?.avatar_url || recipient?.avatar || "https://placehold.co/100x100?text=User" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.recipientName}>{recipient?.first_name || "Chat"}</Text>
            {typingUsers.length > 0 && <Text style={styles.typingIndicator}>typing...</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.attachButton}>
            <Ionicons name="image-outline" size={24} color="#FF3366" />
          </TouchableOpacity>
          <TextInput
            value={text}
            onChangeText={handleTyping}
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  recipientName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  typingIndicator: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 10,
    opacity: 0.9,
  },
  moreButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  myMessageWrapper: {
    justifyContent: "flex-end",
  },
  theirMessageWrapper: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: "#FF3366",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#1F2937",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  myTime: {
    color: "rgba(255,255,255,0.7)",
  },
  theirTime: {
    color: "#9CA3AF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 16,
    color: "#1F2937",
  },
  sendButton: {
    backgroundColor: "#FF3366",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
});
