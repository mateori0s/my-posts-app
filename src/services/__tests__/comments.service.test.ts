/**
 * Tests for CommentsService
 */
import { CommentsService } from '../comments.service';
import type { Comment, CreateCommentInput } from '@/src/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('CommentsService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('getCommentsByPostId', () => {
    const postId = 'post1';

    it('should fetch comments for a post successfully', async () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'Great post!',
          image_url: null,
          created_at: '2024-01-01T00:00:00Z',
          post_id: postId,
          author_id: 'user1',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const result = await CommentsService.getCommentsByPostId(postId);

      expect(fetch).toHaveBeenCalledWith(`/api/posts/${postId}/comments`);
      expect(result.comments).toEqual(mockComments);
      expect(result.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await CommentsService.getCommentsByPostId(postId);

      expect(result.comments).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle non-ok responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Post not found' }),
      });

      const result = await CommentsService.getCommentsByPostId(postId);

      expect(result.comments).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Post not found');
    });
  });

  describe('createComment', () => {
    const mockInput: CreateCommentInput = {
      content: 'Nice post!',
      imageUrl: null,
      userId: 'user1',
      postId: 'post1',
    };

    it('should create a comment successfully', async () => {
      const mockComment: Comment = {
        id: '1',
        content: 'Nice post!',
        image_url: null,
        created_at: '2024-01-01T00:00:00Z',
        post_id: 'post1',
        author_id: 'user1',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await CommentsService.createComment(mockInput);

      expect(fetch).toHaveBeenCalledWith('/api/posts/post1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Nice post!',
          imageUrl: null,
          userId: 'user1',
        }),
      });
      expect(result.comment).toEqual(mockComment);
      expect(result.error).toBeNull();
    });

    it('should create a comment with image', async () => {
      const inputWithImage: CreateCommentInput = {
        content: 'Check this out!',
        imageUrl: 'https://example.com/image.jpg',
        userId: 'user1',
        postId: 'post1',
      };

      const mockComment: Comment = {
        id: '1',
        content: 'Check this out!',
        image_url: 'https://example.com/image.jpg',
        created_at: '2024-01-01T00:00:00Z',
        post_id: 'post1',
        author_id: 'user1',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await CommentsService.createComment(inputWithImage);

      expect(result.comment).toEqual(mockComment);
      expect(result.error).toBeNull();
    });

    it('should reject comments without content', async () => {
      const invalidInput: CreateCommentInput = {
        content: '',
        imageUrl: null,
        userId: 'user1',
        postId: 'post1',
      };

      const result = await CommentsService.createComment(invalidInput);

      expect(fetch).not.toHaveBeenCalled();
      expect(result.comment).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Comment content is required');
    });

    it('should reject comments with whitespace-only content', async () => {
      const invalidInput: CreateCommentInput = {
        content: '   \n\t  ',
        imageUrl: null,
        userId: 'user1',
        postId: 'post1',
      };

      const result = await CommentsService.createComment(invalidInput);

      expect(fetch).not.toHaveBeenCalled();
      expect(result.comment).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await CommentsService.createComment(mockInput);

      expect(result.comment).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle non-ok responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const result = await CommentsService.createComment(mockInput);

      expect(result.comment).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Unauthorized');
    });
  });
});
