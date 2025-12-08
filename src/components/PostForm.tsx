/**
 * Post creation form component
 * Separated for better code organization
 */
"use client";

import { useState, useRef, FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { PostsService } from "@/src/services/posts.service";
import { StorageService } from "@/src/services/storage.service";
import type { User } from "@/src/types";

type PostFormProps = {
  user: User;
  onPostCreated: () => void;
};

export default function PostForm({ user, onPostCreated }: PostFormProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file
    const validation = StorageService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim() && !imageFile) {
      setError("Please add some text or an image");
      return;
    }

    try {
      setSubmitting(true);

      // Upload image if provided
      let imageUrl: string | null = null;
      if (imageFile) {
        const { url, error: uploadError } =
          await StorageService.uploadPostImage(imageFile, user.id);
        if (uploadError) {
          setError(uploadError.message);
          setSubmitting(false);
          return;
        }
        imageUrl = url;
      }

      // Create post
      const { error: postError } = await PostsService.createPost({
        content: content.trim() || undefined,
        imageUrl,
        userId: user.id,
      });

      if (postError) {
        setError(postError.message);
        return;
      }

      // Reset form
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent to refresh posts
      onPostCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create post"
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 md:p-6 rounded-lg shadow-sm border space-y-4"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        className="resize-none"
      />

      {imagePreview && (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="rounded-lg max-h-60 object-cover w-full"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <svg
              className="w-5 h-5"
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
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors inline-block">
            {imageFile ? "Change Image" : "Add Image"}
          </span>
        </label>
        <Button
          type="submit"
          disabled={submitting || (!content.trim() && !imageFile)}
        >
          {submitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
