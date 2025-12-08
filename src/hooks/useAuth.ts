/**
 * Custom hook for authentication
 * Provides user state and authentication methods
 */
"use client";

import { useEffect, useState } from "react";
import { AuthService } from "@/src/services/auth.service";
import { ProfileService } from "@/src/services/profile.service";
import type { User } from "@/src/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const { user: currentUser, error: userError } =
          await AuthService.getCurrentUser();

        if (userError) {
          if (!cancelled) {
            setError(userError);
            setUser(null);
          }
          return;
        }

        if (currentUser) {
          // Try to ensure profile exists (non-blocking)
          try {
            const { data } = await AuthService.getSession();
            if (data.session?.user) {
              await ProfileService.ensureProfile(data.session.user);
            }
          } catch (profileError) {
            console.error("Failed to ensure profile:", profileError);
            // Don't block the app if profile sync fails
          }
        }

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Listen to auth state changes
    const { unsubscribe } = AuthService.onAuthStateChange((updatedUser) => {
      if (!cancelled) {
        setUser(updatedUser);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setLoading(true);
    const { error } = await AuthService.signInWithGitHub();
    if (error) {
      setError(error);
      setLoading(false);
    }
    // Note: Loading will be set to false when auth state changes
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await AuthService.signOut();
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
