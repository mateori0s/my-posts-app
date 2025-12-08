// Shared types for the application

export type User = {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
};

export type Comment = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  post_id: string;
  author_id: string;
  author?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

export type CreatePostInput = {
  content?: string;
  imageUrl?: string | null;
  userId: string;
};

export type CreateCommentInput = {
  content: string;
  imageUrl?: string | null;
  userId: string;
  postId: string;
};
