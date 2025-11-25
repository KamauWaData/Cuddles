import { supabase } from "./supabase";

/**
 * blockUser(blockerId, blockedId)
 */

export async function blockUser(blockerId: string, blockedId: string) {
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: blockerId, blocked_id: blockedId });
    return { error };
}

/**
 * reportUser(reporterId, reportedId, reason)
 */

export async function reportUser(reporterId: string, reportedId: string, reason: string) {
    // simple approach: we insert into a "reports" table
    // for now we write to a simple table  `user_reports`
    const { error } = await supabase
        .from("user_reports")
        .insert({ reporter_id: reporterId, reported_id: reportedId, reason});
    return { error };
}