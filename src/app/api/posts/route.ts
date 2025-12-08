import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServerClient";

// GET /api/posts  -> lista todos los posts
export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        id,
        content,
        image_url,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET /posts error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("Unexpected GET /posts error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/posts  -> crea un nuevo post
export async function POST(req: NextRequest) {
  try {
    const { content, imageUrl, userId } = await req.json();

    // 1) userId obligatorio
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 2) Debe haber al menos texto o imagen
    const hasText = typeof content === "string" && content.trim().length > 0;
    const hasImage =
      typeof imageUrl === "string" && imageUrl.trim().length > 0;

    if (!hasText && !hasImage) {
      return NextResponse.json(
        { error: "Either content or imageUrl is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("posts")
      .insert({
        content: hasText ? content : null,
        image_url: hasImage ? imageUrl : null,
        author_id: userId,
      })
      .select(
        `
        id,
        content,
        image_url,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase POST /posts error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected POST /posts error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
