/**
 * Comments service
 * Handles all comment-related API operations
 */
import type { Comment, CreateCommentInput } from "@/src/types";

export class CommentsService {
  private static getApiBase(postId: string) {
    return `/api/posts/${postId}/comments`;
  }

  /**
   * Fetch all comments for a post
   */
  static async getCommentsByPostId(
    postId: string
  ): Promise<{ comments: Comment[]; error: Error | null }> {
    try {
      const res = await fetch(this.getApiBase(postId));

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return {
          comments: [],
          error: new Error(
            errBody.error || `Failed to fetch comments (status ${res.status})`
          ),
        };
      }

      const data = await res.json();
      return { comments: data, error: null };
    } catch (error) {
      return {
        comments: [],
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch comments"),
      };
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(
    input: CreateCommentInput
  ): Promise<{ comment: Comment | null; error: Error | null }> {
    try {
      // Validate input
      if (!input.content || !input.content.trim()) {
        return {
          comment: null,
          error: new Error("Comment content is required"),
        };
      }

      const res = await fetch(this.getApiBase(input.postId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.content,
          imageUrl: input.imageUrl || null,
          userId: input.userId,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return {
          comment: null,
          error: new Error(
            errBody.error || `Failed to create comment (status ${res.status})`
          ),
        };
      }

      const data = await res.json();
      return { comment: data, error: null };
    } catch (error) {
      return {
        comment: null,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to create comment"),
      };
    }
  }
}
