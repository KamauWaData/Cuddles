// lib/match.ts
import { supabase } from "./supabase";

/**
 * likeProfile
 * - inserts a like
 * - checks mutual like
 * - creates a match row if mutual (ordered user ids to avoid duplicates)
 * - creates a conversation row for the match
 *
 * Returns { matched: boolean, conversationId?: string }
 */
export async function likeProfile(currentId: string, targetId: string) {
  try {
    // ignore duplicate constraint error
    await supabase
      .from("likes")
      .insert({ user_id: currentId, liked_id: targetId })
      .select();

    // check for mutual
    const { data: mutual } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", targetId)
      .eq("liked_id", currentId)
      .single();

    if (!mutual) return { matched: false };

    // create match if not exists (store ordered ids: smaller first)
    const [a, b] = [currentId, targetId].sort();
    const { data: existing } = await supabase
      .from("matches")
      .select("id")
      .or(`(user_a.eq.${a},user_b.eq.${b})`)
      .maybeSingle();

    let matchId = existing?.id;
    if (!matchId) {
      const { data: inserted, error: insertErr } = await supabase
        .from("matches")
        .insert({ user_a: a, user_b: b })
        .select()
        .single();
      if (insertErr) {
        // ignore duplicate error
        console.warn("match insert err", insertErr);
      } else {
        matchId = inserted?.id;
      }
    }

    if (!matchId) {
      // fetch possibly created row
      const { data: matchRow } = await supabase
        .from("matches")
        .select("id")
        .or(`(user_a.eq.${a},user_b.eq.${b})`)
        .single();
      matchId = matchRow?.id;
    }

    // create conversation for the match (if none)
    let conversationId: string | null = null;
    if (matchId) {
      // check existing conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("match_id", matchId)
        .maybeSingle();

      if (conv?.id) {
        conversationId = conv.id;
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ match_id: matchId })
          .select()
          .single();
        conversationId = newConv?.id ?? null;
      }
    }

    return { matched: true, conversationId };
  } catch (err) {
    console.error("likeProfile error", err);
    return { matched: false };
  }
}

/**
 * unlikeProfile - remove a like
 */
export async function unlikeProfile(currentId: string, targetId: string) {
  const { error } = await supabase.from("likes").delete().eq("user_id", currentId).eq("liked_id", targetId);
  return { error };
}
