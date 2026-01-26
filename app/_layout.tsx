import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import BrandedLoading from "../components/BrandedLoading";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { formatError } from "../lib/errorHandler";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments() as string[];

  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const redirected = useRef(false);

  useEffect(() => {
    const run = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setAuthError("Failed to load session. Please restart the app.");
          setChecking(false);
          return;
        }

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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("profile_complete")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // If profile doesn't exist yet, route to onboarding
          if (profileError.code === "PGRST116") {
            router.replace("/(auth)/(onboarding)/ProfileName");
            setChecking(false);
            return;
          }
          // For other errors, log but continue
          console.error("Error fetching profile:", profileError);
        }

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
          router.replace("/(main)");
        }

        setChecking(false);
      } catch (error) {
        const formattedError = formatError(error);
        console.error("Auth check error:", formattedError);
        setAuthError(formattedError.message || "An error occurred. Please restart the app.");
        setChecking(false);
      }
    };

    if (!redirected.current) {
      redirected.current = true;
      run();
    }
  }, [segments]);

  if (checking) return <BrandedLoading message="Connecting..." />;

  return( 
    <GestureHandlerRootView style={{ flex: 1 }}>
  
      <Slot />

    </GestureHandlerRootView>

);
}
