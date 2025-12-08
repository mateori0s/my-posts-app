// src/lib/profile.ts
import { supabase } from "@/src/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export async function ensureProfile(user: User) {
  const usernameFromGithub =
    (user.user_metadata as any)?.user_name ||
    user.email?.split("@")[0] ||
    "anonymous";

  const avatarFromGithub =
    (user.user_metadata as any)?.avatar_url ?? null;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,          // PK = auth user id (uuid)
        username: usernameFromGithub,
        avatar_url: avatarFromGithub,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Error syncing profile:", error);
  }
}
