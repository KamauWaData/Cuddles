// lib/match.ts
export async function likeProfile(currentId: string, targetId: string) {
  // insert like (ignore duplicate)
  await supabase.from("likes").insert({ user_id: currentId, liked_id: targetId });

  // check mutual
  const { data: mutual } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", targetId)
    .eq("liked_id", currentId)
    .single();

  if (mutual) {
    // create match if not exists (order)
    const [a,b] = [currentId, targetId].sort();
    const { error } = await supabase.from("matches").insert({ user_a: a, user_b: b }).select();
    // create conversation
    const { data: matchRow } = await supabase.from("matches").select("id").or(`(user_a.eq.${a},user_b.eq.${b})`).single();
    if (matchRow?.id) {
      const { data: conv } = await supabase.from("conversations").insert({ match_id: matchRow.id }).select().single();
      return { matched: true, conversationId: conv?.id ?? null };
    }
  }
  return { matched: false };
}
