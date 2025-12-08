"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import CommentSection from "@/src/components/CommentSection";

type Post = {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
};

const POST_IMAGES_BUCKET = "post-images";

export default function PostsClient() {
  const { user, loading: userLoading } = useCurrentUser();

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        setError(null);

        const res = await fetch("/api/posts");
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(
            errBody.error || `Failed to fetch posts (status ${res.status})`
          );
        }

        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Error loading posts");
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Subir imagen a Storage, devolver URL pública
  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(POST_IMAGES_BUCKET)
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error("Error uploading image");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(data.path);

    return publicUrl;
  };

  // Crear post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!content.trim() && !imageFile) return;

    try {
      setSubmitting(true);

      const imageUrl = await uploadImageIfNeeded();

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          imageUrl: imageUrl ?? null,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody.error || `Failed to create post (status ${res.status})`
        );
      }

      // limpiar form
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // refrescar posts
      const updated = await fetch("/api/posts").then((r) => r.json());
      setPosts(updated);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const loading = postsLoading || userLoading;

  if (loading) {
    return <p className="text-center mt-6">Loading posts...</p>;
  }

  return (
    <div className="space-y-6 mt-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Formulario para crear posts (solo usuario logueado) */}
      {user && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white p-4 rounded shadow border space-y-3"
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />

          <div className="flex items-center justify-between gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
              }}
              className="text-xs text-gray-600"
            />
            <Button
              type="submit"
              disabled={submitting || (!content.trim() && !imageFile)}
            >
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de posts */}
      <div className="space-y-3">
        {posts.length === 0 && !error && (
          <p className="text-center text-sm text-gray-500">
            No posts yet. Be the first!
          </p>
        )}

        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white p-4 rounded shadow border space-y-3"
          >
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.profiles?.username
                    ? post.profiles.username.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {post.profiles?.username && (
                <span className="text-sm font-medium">
                  {post.profiles.username}
                </span>
              )}
            </div>

            <Card className="shadow-sm">
              <CardContent className="pt-4 space-y-3">
                {post.content && (
                  <p className="text-sm whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="post image"
                    className="rounded max-h-60 object-cover w-full"
                  />
                )}
              </CardContent>
            </Card>

            <span className="text-xs text-gray-400 block">
              {new Date(post.created_at).toLocaleString()}
            </span>

            <CommentSection
              postId={post.id}
              currentUser={
                user
                  ? {
                      id: user.id,
                      username: user.username,
                    }
                  : null
              }
            />
          </article>
        ))}
      </div>
    </div>
  );
}
