/**
 * Tests for AuthService
 */
import { AuthService } from '../auth.service';
import { supabaseBrowser } from '@/src/lib/supabase';
import type { User } from '@/src/types';

// Mock Supabase client
jest.mock('@/src/lib/supabase', () => ({
  supabaseBrowser: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGitHub', () => {
    it('should sign in with GitHub successfully', async () => {
      (supabaseBrowser.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const result = await AuthService.signInWithGitHub();

      expect(supabaseBrowser.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
      expect(result.error).toBeNull();
    });

    it('should handle sign in errors', async () => {
      const mockError = new Error('OAuth error');
      (supabaseBrowser.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
        error: mockError,
      });

      const result = await AuthService.signInWithGitHub();

      expect(result.error).toBe(mockError);
    });

    it('should handle exceptions', async () => {
      (supabaseBrowser.auth.signInWithOAuth as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await AuthService.signInWithGitHub();

      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (supabaseBrowser.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const result = await AuthService.signOut();

      expect(supabaseBrowser.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out error' };
      (supabaseBrowser.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: mockError,
      });

      const result = await AuthService.signOut();

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Sign out error');
    });

    it('should handle exceptions', async () => {
      (supabaseBrowser.auth.signOut as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await AuthService.signOut();

      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockSupabaseUser = {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {
          user_name: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      };

      (supabaseBrowser.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toEqual({
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      });
      expect(result.error).toBeNull();
    });

    it('should return null user when not authenticated', async () => {
      (supabaseBrowser.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle getUser errors', async () => {
      const mockError = { message: 'Get user error' };
      (supabaseBrowser.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Get user error');
    });

    it('should handle user without metadata', async () => {
      const mockSupabaseUser = {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {},
      };

      (supabaseBrowser.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockSupabaseUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toEqual({
        id: 'user1',
        email: 'test@example.com',
        username: undefined,
        avatar_url: undefined,
      });
    });

    it('should handle exceptions', async () => {
      (supabaseBrowser.auth.getUser as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await AuthService.getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      const mockSession = {
        user: { id: 'user1' },
        access_token: 'token',
      };

      (supabaseBrowser.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result.data.session).toEqual(mockSession);
      expect(supabaseBrowser.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (supabaseBrowser.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const { unsubscribe } = AuthService.onAuthStateChange(mockCallback);

      expect(supabaseBrowser.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback with user when session exists', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      let stateChangeCallback: (event: string, session: any) => void;

      (supabaseBrowser.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          stateChangeCallback = callback;
          return {
            data: {
              subscription: {
                unsubscribe: mockUnsubscribe,
              },
            },
          };
        }
      );

      AuthService.onAuthStateChange(mockCallback);

      const mockSession = {
        user: {
          id: 'user1',
          email: 'test@example.com',
          user_metadata: {
            user_name: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      };

      stateChangeCallback!('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith({
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      });
    });

    it('should call callback with null when no session', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      let stateChangeCallback: (event: string, session: any) => void;

      (supabaseBrowser.auth.onAuthStateChange as jest.Mock).mockImplementation(
        (callback) => {
          stateChangeCallback = callback;
          return {
            data: {
              subscription: {
                unsubscribe: mockUnsubscribe,
              },
            },
          };
        }
      );

      AuthService.onAuthStateChange(mockCallback);

      stateChangeCallback!('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('transformUser', () => {
    it('should transform Supabase user to app user', () => {
      const supabaseUser = {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {
          user_name: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      } as any;

      const result = AuthService.transformUser(supabaseUser);

      expect(result).toEqual({
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      });
    });

    it('should return null for null input', () => {
      const result = AuthService.transformUser(null);

      expect(result).toBeNull();
    });

    it('should handle user without email', () => {
      const supabaseUser = {
        id: 'user1',
        email: null,
        user_metadata: {},
      } as any;

      const result = AuthService.transformUser(supabaseUser);

      expect(result).toEqual({
        id: 'user1',
        email: undefined,
        username: undefined,
        avatar_url: undefined,
      });
    });
  });
});
