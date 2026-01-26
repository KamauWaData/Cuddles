import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Determine environment from env vars
const isProduction = process.env.ENVIRONMENT === "production";

// Load credentials based on environment
const SUPABASE_URL = isProduction
  ? process.env.SUPABASE_URL_PROD || ""
  : process.env.SUPABASE_URL_DEV || "";

const SUPABASE_ANON_KEY = isProduction
  ? process.env.SUPABASE_ANON_KEY_PROD || ""
  : process.env.SUPABASE_ANON_KEY_DEV || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    `Missing Supabase credentials for ${isProduction ? "production" : "development"} environment. ` +
    `Set SUPABASE_URL_${isProduction ? "PROD" : "DEV"} and SUPABASE_ANON_KEY_${isProduction ? "PROD" : "DEV"} environment variables.`
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
