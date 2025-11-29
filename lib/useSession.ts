import { useEffect, useState, useCallback } from "react";
import Constants from "expo-constants";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {

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
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (err: any) {
      console.warn("signOut error", err);
    }
  }, []);

  return { session, loading, error, signOut };
}