"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { PostsService } from "@/src/services/posts.service";
import PostForm from "@/src/components/PostForm";
import PostCard from "@/src/components/PostCard";
import type { Post } from "@/src/types";

export default function PostsClient() {
  const { user, loading: userLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { posts: fetchedPosts, error: fetchError } =
        await PostsService.getAllPosts();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setPosts(fetchedPosts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load posts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="text-sm text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Post creation form (only for authenticated users) */}
      {user && <PostForm user={user} onPostCreated={handlePostCreated} />}

      {/* Posts list */}
      <div className="space-y-4">
        {posts.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No posts yet.</p>
            {!user && (
              <p className="text-sm text-gray-400">
                Sign in to create the first post!
              </p>
            )}
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={user} />
        ))}
      </div>
    </div>
  );
}
