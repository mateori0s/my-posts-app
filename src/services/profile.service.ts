/**
 * Profile service
 * Handles profile-related operations
 */
import { supabaseBrowser } from "@/src/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export class ProfileService {
  /**
   * Ensure a user profile exists in the database
   * Called after authentication to sync profile data
   */
  static async ensureProfile(
    user: SupabaseUser
  ): Promise<{ error: Error | null }> {
    try {
      const usernameFromGithub =
        (user.user_metadata as any)?.user_name ||
        user.email?.split("@")[0] ||
        "anonymous";

      const avatarFromGithub =
        (user.user_metadata as any)?.avatar_url ?? null;

      const { error } = await supabaseBrowser.from("profiles").upsert(
        {
          id: user.id, // PK = auth user id (uuid)
          username: usernameFromGithub,
          avatar_url: avatarFromGithub,
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Error syncing profile:", error);
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error
            : new Error("Failed to ensure profile"),
      };
    }
  }
}
