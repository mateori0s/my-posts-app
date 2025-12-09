/**
 * Tests for PostCard component
 */
import { render, screen } from '@testing-library/react';
import PostCard from '../PostCard';
import type { Post, User } from '@/src/types';

// Mock CommentSection component
jest.mock('../CommentSection', () => {
  return function MockCommentSection({
    postId,
    currentUser,
  }: {
    postId: string;
    currentUser: User | null;
  }) {
    return (
      <div data-testid="comment-section">
        CommentSection for post {postId}
      </div>
    );
  };
});

describe('PostCard', () => {
  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg',
  };

  const mockPost: Post = {
    id: 'post1',
    content: 'This is a test post',
    image_url: null,
    created_at: '2024-01-01T12:00:00Z',
    author_id: 'user1',
    profiles: {
      username: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  it('should render post content', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />);

    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should render post with image', () => {
    const postWithImage: Post = {
      ...mockPost,
      image_url: 'https://example.com/image.jpg',
    };

    render(<PostCard post={postWithImage} currentUser={mockUser} />);

    const image = screen.getByAltText('Post content');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render post without image', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />);

    expect(screen.queryByAltText('Post content')).not.toBeInTheDocument();
  });

  it('should display anonymous author when profile is missing', () => {
    const postWithoutProfile: Post = {
      ...mockPost,
      profiles: undefined,
    };

    render(<PostCard post={postWithoutProfile} currentUser={mockUser} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />);

    // Date should be formatted and displayed
    const dateText = screen.getByText(/Jan|January/i);
    expect(dateText).toBeInTheDocument();
  });

  it('should render CommentSection with correct props', () => {
    render(<PostCard post={mockPost} currentUser={mockUser} />);

    const commentSection = screen.getByTestId('comment-section');
    expect(commentSection).toBeInTheDocument();
    expect(commentSection).toHaveTextContent('CommentSection for post post1');
  });

  it('should handle null currentUser', () => {
    render(<PostCard post={mockPost} currentUser={null} />);

    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByTestId('comment-section')).toBeInTheDocument();
  });

  it('should render post with only image and no text', () => {
    const imageOnlyPost: Post = {
      ...mockPost,
      content: null,
      image_url: 'https://example.com/image.jpg',
    };

    render(<PostCard post={imageOnlyPost} currentUser={mockUser} />);

    expect(screen.queryByText('This is a test post')).not.toBeInTheDocument();
    expect(screen.getByAltText('Post content')).toBeInTheDocument();
  });

  it('should display avatar fallback when avatar_url is missing', () => {
    const postWithoutAvatar: Post = {
      ...mockPost,
      profiles: {
        username: 'testuser',
        avatar_url: undefined,
      },
    };

    render(<PostCard post={postWithoutAvatar} currentUser={mockUser} />);

    // Avatar fallback should show first letter of username
    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();
  });
});
