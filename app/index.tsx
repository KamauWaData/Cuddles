
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase"
import { View, ActivityIndicator } from "react-native";
import BrandedLoading from "../components/BrandedLoading";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/(auth)/login");
        return;
      }

      //Fetch profile to check if user is onboarded
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", session.user.id)
        .single();

        if (!profile?.is_onboarded) {
          router.replace("/(onboarding)/ProfileName") //change this later if needed
        } else {
          router.replace("/(main)/home");
        }
    })();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <BrandedLoading message="Loading..." />

    </View>
  )
}