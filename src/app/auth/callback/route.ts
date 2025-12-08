/**
 * OAuth callback handler
 * Handles the redirect from GitHub OAuth
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // Exchange the code for a session
    const { error } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        new URL("/?error=auth_failed", requestUrl.origin)
      );
    }
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
