import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServerClient";

// GET /api/posts/:postId/comments
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json(
      { error: "postId is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabaseServer
      .from("comments")
      .select(
        `
        id,
        content,
        image_url,
        created_at,
        author:profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase GET /comments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("Unexpected GET /comments error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/posts/:postId/comments
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json(
      { error: "postId is required" },
      { status: 400 }
    );
  }

  try {
    const { content, imageUrl, userId } = await req.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: "content and userId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("comments")
      .insert({
        post_id: postId,
        author_id: userId,
        content,
        image_url: imageUrl ?? null,
      })
      .select(
        `
        id,
        content,
        image_url,
        created_at,
        author:profiles (
          id,
          username,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase POST /comments error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected POST /comments error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
