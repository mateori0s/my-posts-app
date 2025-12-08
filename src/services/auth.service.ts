/**
 * Authentication service
 * Handles all authentication-related operations
 */
import { supabaseBrowser } from "@/src/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/src/types";

export class AuthService {
  /**
   * Sign in with GitHub OAuth
   */
  static async signInWithGitHub(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabaseBrowser.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<{
    user: User | null;
    error: Error | null;
  }> {
    try {
      const {
        data: { user },
        error,
      } = await supabaseBrowser.auth.getUser();

      if (error) {
        return { user: null, error: new Error(error.message) };
      }

      if (!user) {
        return { user: null, error: null };
      }

      return {
        user: {
          id: user.id,
          email: user.email ?? undefined,
          username: (user.user_metadata as any)?.user_name,
          avatar_url: (user.user_metadata as any)?.avatar_url,
        },
        error: null,
      };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Get the current session
   */
  static async getSession() {
    return await supabaseBrowser.auth.getSession();
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(
    callback: (user: User | null) => void
  ): { unsubscribe: () => void } {
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email ?? undefined,
          username: (session.user.user_metadata as any)?.user_name,
          avatar_url: (session.user.user_metadata as any)?.avatar_url,
        });
      } else {
        callback(null);
      }
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }

  /**
   * Transform Supabase User to our User type
   */
  static transformUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? undefined,
      username: (supabaseUser.user_metadata as any)?.user_name,
      avatar_url: (supabaseUser.user_metadata as any)?.avatar_url,
    };
  }
}
