
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase"
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/(auth)/Login");
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
          router.replace("/(main)/Home");
        }
    })();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#f472b6" />
    </View>
  )
}