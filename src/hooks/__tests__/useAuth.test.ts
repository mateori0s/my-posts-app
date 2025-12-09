/**
 * Tests for useAuth hook
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthService } from '@/src/services/auth.service';
import { ProfileService } from '@/src/services/profile.service';

// Mock Supabase to avoid real client initialization
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

// Mock services
jest.mock('@/src/services/auth.service');
jest.mock('@/src/services/profile.service');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockProfileService = ProfileService as jest.Mocked<typeof ProfileService>;

describe('useAuth', () => {
  let mockUnsubscribe: jest.Mock;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockAuthService.onAuthStateChange.mockReturnValue({
      unsubscribe: mockUnsubscribe,
    });
    // Suppress expected console.error from profile sync failures
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should initialize with loading state', () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: null,
    });
    mockAuthService.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should fetch and set user on mount', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      username: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    mockAuthService.getCurrentUser.mockResolvedValue({
      user: mockUser,
      error: null,
    });
    mockAuthService.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user1',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    });
    mockProfileService.ensureProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(AuthService.getCurrentUser).toHaveBeenCalled();
  });

  it('should handle error when fetching user fails', async () => {
    const mockError = new Error('Failed to get user');
    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle no authenticated user', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should ensure profile exists when user is authenticated', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
    };

    mockAuthService.getCurrentUser.mockResolvedValue({
      user: mockUser,
      error: null,
    });
    mockAuthService.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user1',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    });
    mockProfileService.ensureProfile.mockResolvedValue(undefined);

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(AuthService.getSession).toHaveBeenCalled();
    });

    expect(ProfileService.ensureProfile).toHaveBeenCalled();
  });

  it('should not block app if profile sync fails', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
    };

    mockAuthService.getCurrentUser.mockResolvedValue({
      user: mockUser,
      error: null,
    });
    mockAuthService.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user1',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    });
    mockProfileService.ensureProfile.mockRejectedValue(
      new Error('Profile sync failed')
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // User should still be set even if profile sync fails
    expect(result.current.user).toEqual(mockUser);
  });

  it('should subscribe to auth state changes', () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: null,
    });

    renderHook(() => useAuth());

    expect(AuthService.onAuthStateChange).toHaveBeenCalled();
  });

  it('should update user when auth state changes', async () => {
    let authStateCallback: ((user: any) => void) | null = null;

    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: null,
    });
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return { unsubscribe: mockUnsubscribe };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newUser = {
      id: 'user2',
      email: 'new@example.com',
      username: 'newuser',
    };

    act(() => {
      authStateCallback!(newUser);
    });

    expect(result.current.user).toEqual(newUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle sign out via auth state change', async () => {
    let authStateCallback: ((user: any) => void) | null = null;

    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
    };

    mockAuthService.getCurrentUser.mockResolvedValue({
      user: mockUser,
      error: null,
    });
    mockAuthService.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user1' },
        },
      },
      error: null,
    });
    mockProfileService.ensureProfile.mockResolvedValue(undefined);
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return { unsubscribe: mockUnsubscribe };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    act(() => {
      authStateCallback!(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      user: null,
      error: null,
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  describe('signIn', () => {
    it('should call AuthService.signInWithGitHub', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({
        user: null,
        error: null,
      });
      mockAuthService.signInWithGitHub.mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(AuthService.signInWithGitHub).toHaveBeenCalled();
      expect(result.current.loading).toBe(true);
    });

    it('should handle sign in error', async () => {
      const mockError = new Error('Sign in failed');
      mockAuthService.getCurrentUser.mockResolvedValue({
        user: null,
        error: null,
      });
      mockAuthService.signInWithGitHub.mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn();
      });

      expect(result.current.error).toEqual(mockError);
      // When there's an error, loading is set to false immediately
      expect(result.current.loading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should call AuthService.signOut', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({
        user: null,
        error: null,
      });
      mockAuthService.signOut.mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(AuthService.signOut).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('should handle sign out error', async () => {
      const mockError = new Error('Sign out failed');
      mockAuthService.getCurrentUser.mockResolvedValue({
        user: null,
        error: null,
      });
      mockAuthService.signOut.mockResolvedValue({
        error: mockError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should not update state if component is unmounted', async () => {
    mockAuthService.getCurrentUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ user: null, error: null });
          }, 100);
        })
    );

    const { unmount } = renderHook(() => useAuth());

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 150));

    // Component should not update after unmount
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
