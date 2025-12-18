import { supabase } from "./supabase";
import { uploadToCloudinary } from "./cloudinary";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "file";
  delivery_status: "sent" | "delivered" | "read";
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  attachment_type: "image" | "video" | "file";
  attachment_url: string;
  file_name: string;
  file_size: number;
  width: number;
  height: number;
  created_at: string;
}

export interface ReadReceipt {
  id: string;
  message_id: string;
  read_by_user_id: string;
  read_at: string;
}

/**
 * Send a text message
 */
export async function sendMessage(
  conversationId: string,
  message: string
): Promise<ChatMessage | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const senderId = authData?.user?.id;
    if (!senderId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message,
        message_type: "text",
        delivery_status: "sent",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Send message error:", error);
    return null;
  }
}

/**
 * Send image message
 */
export async function sendImageMessage(
  conversationId: string,
  imageUri: string,
  fileName?: string
): Promise<ChatMessage | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const senderId = authData?.user?.id;
    if (!senderId) throw new Error("User not authenticated");

    // Upload image to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(imageUri);
    if (!cloudinaryUrl) throw new Error("Failed to upload image");

    // Create message
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        message: "[Image]",
        message_type: "image",
        delivery_status: "sent",
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Create attachment record
    const { error: attachmentError } = await supabase.from("message_attachments").insert({
      message_id: messageData.id,
      attachment_type: "image",
      attachment_url: cloudinaryUrl,
      file_name: fileName || "image.jpg",
      file_size: 0, // Would need to get from image info
    });

    if (attachmentError) throw attachmentError;

    return messageData;
  } catch (error) {
    console.error("Send image message error:", error);
    return null;
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Insert read receipt
    const { error: receiptError } = await supabase
      .from("message_read_receipts")
      .insert({
        message_id: messageId,
        read_by_user_id: userId,
        read_at: new Date().toISOString(),
      });

    if (receiptError && receiptError.code !== "23505") {
      // 23505 = unique constraint violation (already read)
      throw receiptError;
    }

    // Update message delivery status
    const { error: updateError } = await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        delivery_status: "read",
      })
      .eq("id", messageId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Mark message as read error:", error);
    return false;
  }
}

/**
 * Mark conversation messages as read
 */
export async function markConversationAsRead(conversationId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Get unread messages
    const { data: messages, error: fetchError } = await supabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (fetchError) throw fetchError;

    if (!messages || messages.length === 0) {
      return true; // No unread messages
    }

    // Mark all as read
    const results = await Promise.all(
      messages.map((msg) => markMessageAsRead(msg.id))
    );

    return results.every((r) => r);
  } catch (error) {
    console.error("Mark conversation as read error:", error);
    return false;
  }
}

/**
 * Get message attachments
 */
export async function getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
  try {
    const { data, error } = await supabase
      .from("message_attachments")
      .select("*")
      .eq("message_id", messageId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get message attachments error:", error);
    return [];
  }
}

/**
 * Get read receipts for a message
 */
export async function getReadReceipts(messageId: string): Promise<ReadReceipt[]> {
  try {
    const { data, error } = await supabase
      .from("message_read_receipts")
      .select("*")
      .eq("message_id", messageId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get read receipts error:", error);
    return [];
  }
}

// ============================================================================
// TYPING INDICATORS
// ============================================================================

/**
 * Set typing indicator
 */
export async function setTypingIndicator(conversationId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const expiresAt = new Date(Date.now() + 10000); // 10 seconds

    const { error } = await supabase.from("typing_indicators").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "conversation_id,user_id" }
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Set typing indicator error:", error);
    return false;
  }
}

/**
 * Remove typing indicator
 */
export async function removeTypingIndicator(conversationId: string): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("typing_indicators")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Remove typing indicator error:", error);
    return false;
  }
}

/**
 * Get active typing indicators in conversation
 */
export async function getTypingIndicators(
  conversationId: string
): Promise<{ user_id: string; created_at: string }[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("typing_indicators")
      .select("user_id, created_at")
      .eq("conversation_id", conversationId)
      .gt("expires_at", now);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get typing indicators error:", error);
    return [];
  }
}

/**
 * Subscribe to typing indicators in real-time
 */
export function subscribeToTypingIndicators(
  conversationId: string,
  onTyping: (typingUsers: string[]) => void
) {
  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "typing_indicators",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async () => {
        const typing = await getTypingIndicators(conversationId);
        const typingUserIds = typing.map((t) => t.user_id);
        onTyping(typingUserIds);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to read receipts in real-time
 */
export function subscribeToReadReceipts(
  conversationId: string,
  onReadReceipt: (messageId: string, userId: string) => void
) {
  const channel = supabase
    .channel(`read-receipts:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message_read_receipts",
      },
      (payload) => {
        onReadReceipt(payload.new.message_id, payload.new.read_by_user_id);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
