// app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  if (session) return <Redirect href="/(main)/Home" />;
  return <Redirect href="/(auth)/Login" />;
}
