/**
 * Tests for PostsService
 */
import { PostsService } from '../posts.service';
import type { Post, CreatePostInput } from '@/src/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('PostsService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getAllPosts', () => {
    it('should fetch all posts successfully', async () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          content: 'Test post',
          image_url: null,
          created_at: '2024-01-01T00:00:00Z',
          author_id: 'user1',
          profiles: {
            username: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await PostsService.getAllPosts();

      expect(fetch).toHaveBeenCalledWith('/api/posts');
      expect(result.posts).toEqual(mockPosts);
      expect(result.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await PostsService.getAllPosts();

      expect(result.posts).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle non-ok responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const result = await PostsService.getAllPosts();

      expect(result.posts).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Server error');
    });

    it('should handle non-ok responses without error body', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await PostsService.getAllPosts();

      expect(result.posts).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('status 404');
    });
  });

  describe('createPost', () => {
    const mockInput: CreatePostInput = {
      content: 'New post',
      imageUrl: null,
      userId: 'user1',
    };

    it('should create a post successfully with text', async () => {
      const mockPost: Post = {
        id: '1',
        content: 'New post',
        image_url: null,
        created_at: '2024-01-01T00:00:00Z',
        author_id: 'user1',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await PostsService.createPost(mockInput);

      expect(fetch).toHaveBeenCalledWith('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'New post',
          imageUrl: null,
          userId: 'user1',
        }),
      });
      expect(result.post).toEqual(mockPost);
      expect(result.error).toBeNull();
    });

    it('should create a post successfully with image', async () => {
      const inputWithImage: CreatePostInput = {
        content: '',
        imageUrl: 'https://example.com/image.jpg',
        userId: 'user1',
      };

      const mockPost: Post = {
        id: '1',
        content: null,
        image_url: 'https://example.com/image.jpg',
        created_at: '2024-01-01T00:00:00Z',
        author_id: 'user1',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await PostsService.createPost(inputWithImage);

      expect(result.post).toEqual(mockPost);
      expect(result.error).toBeNull();
    });

    it('should reject posts with neither text nor image', async () => {
      const invalidInput: CreatePostInput = {
        content: '',
        imageUrl: null,
        userId: 'user1',
      };

      const result = await PostsService.createPost(invalidInput);

      expect(fetch).not.toHaveBeenCalled();
      expect(result.post).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe(
        'Post must contain either text or an image'
      );
    });

    it('should handle whitespace-only content as empty', async () => {
      const invalidInput: CreatePostInput = {
        content: '   \n\t  ',
        imageUrl: null,
        userId: 'user1',
      };

      const result = await PostsService.createPost(invalidInput);

      expect(fetch).not.toHaveBeenCalled();
      expect(result.post).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await PostsService.createPost(mockInput);

      expect(result.post).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle non-ok responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation error' }),
      });

      const result = await PostsService.createPost(mockInput);

      expect(result.post).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Validation error');
    });
  });
});
