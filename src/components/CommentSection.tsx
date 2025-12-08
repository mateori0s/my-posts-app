"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";

type UserInfo = {
  id: string;
  username?: string;
};

type Comment = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

type CommentSectionProps = {
  postId: string;
  currentUser: UserInfo | null;
};

export default function CommentSection({
  postId,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody.error || `Failed to fetch comments (status ${res.status})`
        );
      }

      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Error loading comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          imageUrl: null, // más adelante podemos sumar imágenes
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          errBody.error || `Failed to create comment (status ${res.status})`
        );
      }

      const created = await res.json();
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      // opcional: setError(...)
    }
  };

  return (
    <div className="mt-4 border-t pt-3 space-y-3">
      {/* Formulario para comentar */}
      {currentUser && (
        <form onSubmit={handleAddComment} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            placeholder="Write a comment..."
            className="text-sm"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              Comment
            </Button>
          </div>
        </form>
      )}

      {!currentUser && (
        <p className="text-xs text-gray-500">
          Log in to leave a comment.
        </p>
      )}

      {/* Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Lista de comentarios */}
      {loading ? (
        <p className="text-xs text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="text-sm bg-gray-50 rounded px-3 py-2"
            >
              {comment.author?.username && (
                <p className="text-xs text-gray-500 mb-1">
                  {comment.author.username}
                </p>
              )}

              <p className="whitespace-pre-wrap">{comment.content}</p>

              {comment.image_url && (
                <img
                  src={comment.image_url}
                  alt="comment image"
                  className="mt-2 rounded max-h-40 object-cover"
                />
              )}

              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(comment.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
