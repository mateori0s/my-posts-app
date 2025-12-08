"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

export default function Navbar() {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-xl">My Posts App</h1>

        {loading ? (
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username
                    ? user.username.charAt(0).toUpperCase()
                    : user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden sm:inline text-gray-700">
                {user.username || user.email || "User"}
              </span>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={signIn} size="sm">
            Login with GitHub
          </Button>
        )}
      </div>
    </header>
  );
}
