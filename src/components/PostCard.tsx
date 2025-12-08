/**
 * Post card component
 * Displays a single post with its content and metadata
 */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Card, CardContent } from "@/src/components/ui/card";
import CommentSection from "@/src/components/CommentSection";
import type { Post, User } from "@/src/types";

type PostCardProps = {
  post: Post;
  currentUser: User | null;
};

export default function PostCard({ post, currentUser }: PostCardProps) {
  const authorName = post.profiles?.username || "Anonymous";
  const authorAvatar = post.profiles?.avatar_url;

  return (
    <article className="bg-white p-4 md:p-6 rounded-lg shadow-sm border space-y-4">
      {/* Author info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback>
            {authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{authorName}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Post content */}
      <Card className="shadow-none border-0">
        <CardContent className="pt-0 space-y-3">
          {post.content && (
            <p className="text-sm md:text-base whitespace-pre-wrap text-gray-800">
              {post.content}
            </p>
          )}
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full h-auto max-h-96 object-contain bg-gray-50"
                loading="lazy"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments section */}
      <CommentSection
        postId={post.id}
        currentUser={currentUser}
      />
    </article>
  );
}
