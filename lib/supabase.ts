import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// ...existing code...
const expoExtra =
  // new Expo SDKs use expoConfig
  (Constants.expoConfig && Constants.expoConfig.extra) ||
  // older SDKs use manifest
 // (Constants.manifest && (Constants.manifest as any).extra) ||
  {};

const SUPABASE_URL =
  process.env.SUPABASE_URL || (expoExtra.SUPABASE_URL as string) || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || (expoExtra.SUPABASE_ANON_KEY as string) || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to app.json > expo.extra or set env."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});