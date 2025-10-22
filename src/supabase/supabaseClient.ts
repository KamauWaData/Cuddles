// Supabase client instance used across the app.
// Provide SUPABASE_URL and SUPABASE_ANON_KEY via environment variables or another secure config.
import { createClient } from '@supabase/supabase-js';

// Replace process.env values with your runtime config if using Expo or react-native-dotenv
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // During development it's helpful to surface a warning — remove in production
  // eslint-disable-next-line no-console
  console.warn('Supabase URL or Anon key not set. Set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// If you need typed Database interface, replace `any` with your generated types.
export type Database = any;
