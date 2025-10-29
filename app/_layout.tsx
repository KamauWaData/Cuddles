// ...existing code...
import React, { useEffect, useRef } from "react";
import { Slot } from "expo-router";
import { useRouter } from "expo-router";
import { useSession } from "../lib/useSession";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { session, loading } = useSession();
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    // decide target route (must be an actual route file)
    const onboarded = (session as any)?.user?.user_metadata?.onboarded;
    const target = !session ? "/(auth)/login" : !onboarded ? "/(auth)/(onboarding)/ProfileName" : null;

    if (!target) return;
    if (lastRedirectRef.current === target) return; // already redirected to this target

    lastRedirectRef.current = target;
    // schedule a single replace to avoid rapid repeated navigation
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
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return <Slot />;
}
// ...existing code...