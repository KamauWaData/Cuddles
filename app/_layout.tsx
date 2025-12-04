import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import BrandedLoading from "../components/BrandedLoading";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments() as string[];

  const [checking, setChecking] = useState(true);
  const redirected = useRef(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      const root = segments[0];
      const leaf = segments[1];

      // 1) NOT LOGGED IN → FORCE AUTH
      if (!session) {
        if (root !== "(auth)") router.replace("/(auth)/Login");
        setChecking(false);
        return;
      }

      // 2) GET PROFILE
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_complete")
        .eq("id", session.user.id)
        .single();

      const onboarded = profile?.profile_complete;

      // 3) NOT ONBOARDED → FORCE ONBOARDING
      if (!onboarded) {
        if (root !== "(auth)" || !leaf?.includes("onboarding")) {
          router.replace("/(auth)/(onboarding)/ProfileName");
        }
        setChecking(false);
        return;
      }

      // 4) LOGGED IN + ONBOARDED → FORCE MAIN SCREENS
      if (root === "(auth)") {
        router.replace("/(main)/Home");
      }

      setChecking(false);
    };

    if (!redirected.current) {
      redirected.current = true;
      run();
    }
  }, [segments]);

  if (checking) return <BrandedLoading message="Connecting..." />;

  return <Slot />;
}
