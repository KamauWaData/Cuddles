import React, { useEffect, useRef, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import BrandedLoading from "../components/BrandedLoading";

export default function RootLayout() {
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!mounted) return;

      if (!session) {
        safeRedirect("/(auth)/Login");
        setChecking(false);
        return;
      }

      // Fetch onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_complete")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;

      if (!profile?.profile_complete) {
        safeRedirect("/(auth)/(onboarding)/ProfileName");
      } else {
        safeRedirect("/(main)/Home");
      }

      setChecking(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function safeRedirect(target: string) {
    if (lastRedirectRef.current === target) return;
    lastRedirectRef.current = target;
    router.replace(target);
  }

  if (checking) {
    return <BrandedLoading message="Connecting..." />;
  }

  return <Slot />;
}
