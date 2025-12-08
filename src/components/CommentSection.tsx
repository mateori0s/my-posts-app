"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { CommentsService } from "@/src/services/comments.service";
import { StorageService } from "@/src/services/storage.service";
import type { Comment, User } from "@/src/types";

type CommentSectionProps = {
  postId: string;
  currentUser: User | null;
};

export default function CommentSection({
  postId,
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { comments: fetchedComments, error: fetchError } =
        await CommentsService.getCommentsByPostId(postId);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setComments(fetchedComments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load comments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const validation = StorageService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setImageFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newComment.trim() && !imageFile) {
      setError("Please add some text or an image");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Upload image if provided
      let imageUrl: string | null = null;
      if (imageFile) {
        const { url, error: uploadError } =
          await StorageService.uploadCommentImage(imageFile, currentUser.id);
        if (uploadError) {
          setError(uploadError.message);
          setSubmitting(false);
          return;
        }
        imageUrl = url;
      }

      // Create comment
      const { comment, error: commentError } =
        await CommentsService.createComment({
          content: newComment.trim(),
          imageUrl,
          userId: currentUser.id,
          postId,
        });

      if (commentError) {
        setError(commentError.message);
        return;
      }

      if (comment) {
        setComments((prev) => [...prev, comment]);
      }

      // Reset form
      setNewComment("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create comment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      {/* Comment form (only for authenticated users) */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            placeholder="Write a comment..."
            className="text-sm resize-none"
          />

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg max-h-40 object-cover w-full"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border rounded hover:bg-gray-50 transition-colors inline-block">
                {imageFile ? "Change" : "Add Image"}
              </span>
            </label>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || (!newComment.trim() && !imageFile)}
            >
              {submitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">
          Log in to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <p className="text-xs text-gray-400 text-center py-2">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          No comments yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex gap-3 bg-gray-50 rounded-lg px-3 py-3"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.author?.avatar_url} />
                <AvatarFallback>
                  {comment.author?.username
                    ? comment.author.username.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-gray-900">
                    {comment.author?.username || "Anonymous"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-800 mb-2">
                  {comment.content}
                </p>
                {comment.image_url && (
                  <div className="rounded-lg overflow-hidden mt-2">
                    <img
                      src={comment.image_url}
                      alt="Comment"
                      className="max-h-48 object-contain w-full bg-gray-100"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
