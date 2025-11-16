import { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

const expoExtra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
// toggle options (prefer app.json extra or set globalThis.__BYPASS_AUTH__ in App.tsx)
const BYPASS_AUTH =
  typeof globalThis !== "undefined" && (globalThis as any).__BYPASS_AUTH__ === true ||
  process.env.BYPASS_AUTH === "true" ||
  expoExtra.BYPASS_AUTH === true ||
  false;

const DEV_FAKE_SESSION: Session = {
  // minimal shape for your app's checks; adjust user_metadata as needed
  access_token: "dev-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "dev-refresh",
  provider_token: null,
  provider_refresh_token: null,
  user: {
    id: "dev-user",
    app_metadata: {},
    user_metadata: { onboarded: true }, // set to false to test onboarding
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "dev@example.com",
    role: "authenticated",
  } as any,
  // supabase-js Session has other fields but casting is fine for dev
} as unknown as Session;

export function useSession() {
  const [session, setSession] = useState<Session | null>(BYPASS_AUTH ? DEV_FAKE_SESSION : null);
  const [loading, setLoading] = useState<boolean>(BYPASS_AUTH ? false : true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (BYPASS_AUTH) return; // no network/auth subscription when bypassing

    let mounted = true;
    async function init() {
      try {
        setLoading(true);
        const resp = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(resp?.data?.session ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();

    const { data } = supabase.auth.onAuthStateChange((_event: any, newSession: Session | null) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (BYPASS_AUTH) {
      setSession(null);
      return;
    }
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (err: any) {
      console.warn("signOut error", err);
    }
  }, []);

  return { session, loading, error, signOut };
}