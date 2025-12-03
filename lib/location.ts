// lib/location.ts
import * as Location from "expo-location";
import { supabase } from "./supabase";

export async function saveMyLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const loc = await Location.getCurrentPositionAsync({});
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;
  await supabase.from('profiles').upsert([{ id: uid, latitude: loc.coords.latitude, longitude: loc.coords.longitude }]);
  return loc.coords;
}
