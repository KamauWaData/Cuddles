// lib/favorites.ts
import { supabase } from "./supabase";

export async function addFavorite(userId: string, favoriteId: string) {
  return supabase.from('favorites').insert({ user_id: userId, favorite_id: favoriteId }).select();
}

export async function removeFavorite(userId: string, favoriteId: string) {
  return supabase.from('favorites').delete().eq('user_id', userId).eq('favorite_id', favoriteId);
}

export async function listFavorites(userId: string) {
  return supabase.from('favorites').select('favorite_id, created_at, favorite:profiles(id, first_name, avatar)').eq('user_id', userId);
}
