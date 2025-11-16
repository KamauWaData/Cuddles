import React, { useEffect, useRef } from "react";
import { Slot, useRouter } from "expo-router";
import { useSession } from "../lib/useSession";
import BrandedLoading from "../components/BrandedLoading";

export default function RootLayout() {
  const { session, loading } = useSession();
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const onboarded = (session as any)?.user?.user_metadata?.onboarded;
    const target = !session
      ? "/(auth)/login"
      : !onboarded
      ? "/(auth)/(onboarding)/ProfileName"
      : null;

    if (!target) return;
    if (lastRedirectRef.current === target) return;

    lastRedirectRef.current = target;
    const t = setTimeout(() => {
      try {
        router.replace(target);
      } catch (e) {
        console.warn("router.replace failed:", e);
      }
    }, 40);

    return () => clearTimeout(t);
  }, [loading, session, router]);

  if (loading) {
    return <BrandedLoading message="Connecting..." />;
  }

  return <Slot />;
}
