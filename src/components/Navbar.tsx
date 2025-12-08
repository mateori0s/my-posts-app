"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabaseBrowserClient";
import { Button } from "@/src/components/ui/button";

type UserInfo = {
  id: string;
  email?: string;
  username?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // obtener sesión actual
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? undefined,
          username: data.user.user_metadata?.user_name,
        });
      }
    });

    // escuchar cambios de auth (login/logout)
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          username: session.user.user_metadata?.user_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "github",
    });
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">My Posts App</h1>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">
              {user.username || user.email || "Logged in"}
            </span>
            <Button onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin}>
            Login with GitHub
          </Button>
        )}
      </div>
    </header>
  );
}
