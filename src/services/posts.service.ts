/**
 * Posts service
 * Handles all post-related API operations
 */
import type { Post, CreatePostInput } from "@/src/types";

export class PostsService {
  private static readonly API_BASE = "/api/posts";

  /**
   * Fetch all posts
   */
  static async getAllPosts(): Promise<{
    posts: Post[];
    error: Error | null;
  }> {
    try {
      const res = await fetch(this.API_BASE);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return {
          posts: [],
          error: new Error(
            errBody.error || `Failed to fetch posts (status ${res.status})`
          ),
        };
      }

      const data = await res.json();
      return { posts: data, error: null };
    } catch (error) {
      return {
        posts: [],
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch posts"),
      };
    }
  }

  /**
   * Create a new post
   */
  static async createPost(
    input: CreatePostInput
  ): Promise<{ post: Post | null; error: Error | null }> {
    try {
      // Validate input
      const hasText = input.content && input.content.trim().length > 0;
      const hasImage = input.imageUrl && input.imageUrl.trim().length > 0;

      if (!hasText && !hasImage) {
        return {
          post: null,
          error: new Error("Post must contain either text or an image"),
        };
      }

      const res = await fetch(this.API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.content || null,
          imageUrl: input.imageUrl || null,
          userId: input.userId,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return {
          post: null,
          error: new Error(
            errBody.error || `Failed to create post (status ${res.status})`
          ),
        };
      }

      const data = await res.json();
      return { post: data, error: null };
    } catch (error) {
      return {
        post: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to create post"),
      };
    }
  }
}
