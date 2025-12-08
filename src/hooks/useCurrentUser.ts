"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { ensureProfile } from "@/src/lib/profile";

export type CurrentUser = {
  id: string;
  email?: string;
  username?: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error);
          return;
        }

        if (data.user) {
          // intentamos sincronizar profile, pero SI FALLA no bloqueamos la app
          try {
            await ensureProfile(data.user);
          } catch (err) {
            console.error("ensureProfile failed:", err);
          }

          if (cancelled) return;

          setUser({
            id: data.user.id,
            email: data.user.email ?? undefined,
            username: (data.user.user_metadata as any)?.user_name,
          });
        } else {
          if (cancelled) return;
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false); // 🔴 SIEMPRE se ejecuta
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          await ensureProfile(session.user);
        } catch (err) {
          console.error("ensureProfile failed on auth change:", err);
        }

        if (!cancelled) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
            username: (session.user.user_metadata as any)?.user_name,
          });
        }
      } else {
        if (!cancelled) setUser(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
