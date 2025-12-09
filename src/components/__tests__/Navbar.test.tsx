/**
 * Tests for Navbar component
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

// Mock useAuth hook
jest.mock('@/src/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/src/hooks/useAuth';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Navbar', () => {
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
    });

    render(<Navbar />);

    const loginButton = screen.getByText('Login with GitHub');
    expect(loginButton).toBeInTheDocument();
    expect(screen.getByText('My Posts App')).toBeInTheDocument();
  });

  it('should call signIn when login button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
    });

    render(<Navbar />);

    const loginButton = screen.getByText('Login with GitHub');
    fireEvent.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should render user info and logout button when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login with GitHub')).not.toBeInTheDocument();
  });

  it('should call signOut when logout button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: false,
    });

    render(<Navbar />);

    expect(screen.queryByText('Login with GitHub')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    // Loading placeholder should be present (check for the animated pulse div)
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should display email when username is not available', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        email: 'test@example.com',
        username: undefined,
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display "User" when neither username nor email is available', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should display avatar fallback with first letter of username', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        username: 'testuser',
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    const avatarFallback = screen.getByText('T');
    expect(avatarFallback).toBeInTheDocument();
  });

  it('should display avatar fallback with first letter of email when username is missing', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user1',
        email: 'test@example.com',
        username: undefined,
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isAuthenticated: true,
    });

    render(<Navbar />);

    const avatarFallback = screen.getByText('T');
    expect(avatarFallback).toBeInTheDocument();
  });
});
