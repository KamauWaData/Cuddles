import { supabase } from "./supabase";

export interface OnlineStatus {
  id: string;
  user_id: string;
  is_online: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Initialize online status tracking
 * Call this when user opens the app
 */
export async function initializeOnlineStatus(): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase.from("online_status").upsert(
      {
        user_id: userId,
        is_online: true,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;

    // Set up periodic heartbeat to keep user "online"
    setupOnlineHeartbeat(userId);

    return true;
  } catch (error) {
    console.error("Initialize online status error:", error);
    return false;
  }
}

/**
 * Set up periodic heartbeat to keep user online
 */
let heartbeatInterval: NodeJS.Timeout | null = null;

function setupOnlineHeartbeat(userId: string): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // Update last_active_at every 30 seconds
  heartbeatInterval = setInterval(async () => {
    try {
      await supabase
        .from("online_status")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Heartbeat error:", error);
    }
  }, 30000);
}

/**
 * Mark user as offline
 * Call this when user closes the app or logs out
 */
export async function setOfflineStatus(): Promise<boolean> {
  try {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("online_status")
      .update({
        is_online: false,
        last_active_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Set offline status error:", error);
    return false;
  }
}

/**
 * Get user's online status
 */
export async function getOnlineStatus(userId: string): Promise<OnlineStatus | null> {
  try {
    const { data, error } = await supabase
      .from("online_status")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No status found, create one
        const { data: newStatus } = await supabase
          .from("online_status")
          .insert({
            user_id: userId,
            is_online: false,
            last_active_at: new Date().toISOString(),
          })
          .select()
          .single();
        return newStatus;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Get online status error:", error);
    return null;
  }
}

/**
 * Get human-readable "last active" text
 */
export function getLastActiveText(lastActiveAt: string): string {
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - lastActive.getTime()) / 1000);

  if (secondsAgo < 60) {
    return "Online now";
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `Active ${minutesAgo}m ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `Active ${hoursAgo}h ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `Active ${daysAgo}d ago`;
  }
}

/**
 * Check if user is recently active (within last hour)
 */
export function isRecentlyActive(lastActiveAt: string): boolean {
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const hoursAgo = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  return hoursAgo < 1;
}

/**
 * Subscribe to online status changes
 */
export function subscribeToOnlineStatus(
  userId: string,
  onStatusChange: (status: OnlineStatus) => void
) {
  const channel = supabase
    .channel(`online-status:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "online_status",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onStatusChange(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Get list of recently active users for discovery
 */
export async function getRecentlyActiveUsers(
  limit: number = 50
): Promise<any[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return [];

    // Get users active in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("online_status")
      .select(
        `
        user_id,
        last_active_at,
        is_online,
        profiles:profiles(
          id,
          first_name,
          last_name,
          name,
          avatar_url,
          location
        )
      `
      )
      .neq("user_id", currentUserId)
      .gt("last_active_at", oneDayAgo)
      .order("last_active_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Get recently active users error:", error);
    return [];
  }
}

/**
 * Get online users count for a feature badge
 */
export async function getOnlineUsersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("online_status")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Get online users count error:", error);
    return 0;
  }
}
