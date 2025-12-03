import { supabase } from "./supabase";

/**
 * Insert a like (normal or superlike) and handle match creation.
 * Returns:
 *  { matched: boolean, matchId?: string, conversationId?: string, createdLike?: any }
 */

export async function likeProfile(currentId: string, targetId: string, opts?: { superlike?: boolean}) {
    try {
      // Insert the like (ignore unique constraint errors)
      const payload: any = {
        user_id: currentId,
        liked_id: targetId,
        superlike: !!opts?.superlike,
        liked_at: new Date().toISOString(),
      };

      // upsert to avoid duplicates (if you prefer strict insert, change to insert)
      await supabase.from("likes").upsert(payload, { onConflict: ["user_id", "liked_id"] });

      // check for mutual like (target liked current)
      const { data: mutual, error: mutualErr } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();

      if (mutualErr) {
        console.warn("mutual check error", mutualErr);
      }

      if (!mutual) {
        // not a match yet
        // optionally return the created like info
        const { data: createdLike } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", currentId)
          .eq("liked_id", targetId)
          .maybeSingle();

        return { matched: false, createdLike };
      }

      // It's mutual => create a match entry (no duplicates)
      const [a, b] = [currentId, targetId].sort();
      // try to fetch existing match
      const { data: existing, error: existingErr} = await supabase
        .from("matches")
        .select("id")
        .or(`user_a.eq.${a}, user_b.eq.${b}`)
        .maybeSingle();

        if(existingErr) {
          console.warn("existing match check error", existingErr);
        }

        let matchId = existing?.id;

        if (!matchId) {
          const { data: inserted, error: insertErr } = await supabase
            .from("matches")
            .insert({ user_a:a, user_b:b })
            .select()
            .single();

          if(insertErr) {
            console.warn("match insert error", insertErr);
          } else {
            matchId = inserted?.id;
          }
        }

        // ensure conversation exists for this match
        let conversationId: string | null = null;
        if (matchId) {
          const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("id")
            .eq("match_id", matchId)
            .maybeSingle();

          if (convErr) {
            console.warn("conversations check error", convErr);
          }

          if (convErr) {
            console.warn("conversation check error", convErr);
          }

          if (conv?.id) {
            conversationId = conv.id;
          } else {
            const { data: newConv, error: newConvErr } = await supabase
              .from("conversations")
              .insert({ match_id: matchId})
              .select()
              .single();
            if (newConvErr) {
              console.warn("create conv error", newConvErr);
            } else {
              conversationId = newConv?.id ?? null;
            }
          }
        }

        return { matched: true, matchId, conversationId }
    } catch (err) {
      console.error("likedProfile error", err);
      return { matched: false };
    }
}

/** Remove a like (dislike/pass) */
export async function unlikeProfile(currentId: string, targetId: string) {
  try {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", currentId)
      .eq("liked_id", targetId);

      return { error: error ?? null };
  } catch (err) {
    console.error("unlikeProfile error", err);
    return { error: err };
  }
}

export async function getLikesForUser(userId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("user_id, liked_id, superlike, liked_at")
    .or(`user_id.eq.${userId}, liked_id.eq.${userId}`);

  return { data, error };
  
}