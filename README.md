# My Posts App

A modern web application for creating posts and comments with GitHub OAuth authentication, built with Next.js, React, TypeScript, Supabase, and Tailwind CSS.

## 📋 Overview

My Posts App is a full-stack social media application that allows users to create and share posts with text and images, as well as comment on posts. The application features:

- **GitHub OAuth Authentication**: Seamless login and registration using Supabase Auth
- **Post Creation**: Authenticated users can create posts with text content and images
- **Public Post Viewing**: All users (authenticated or not) can view posts
- **Comment System**: Authenticated users can add comments to posts with text and optional images
- **Image Storage**: Secure image upload and storage using Supabase Storage
- **Responsive Design**: Mobile-first design that works across all device sizes

The application follows modern web development best practices, including clean architecture, type safety, and comprehensive testing.

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (GitHub OAuth)
- **File Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Testing**: Jest + React Testing Library

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Server-side endpoints)
│   │   └── posts/         # Posts and comments API endpoints
│   ├── auth/              # Authentication routes
│   │   └── callback/      # OAuth callback handler
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── PostCard.tsx      # Individual post display component
│   ├── PostForm.tsx      # Post creation form
│   ├── CommentSection.tsx # Comment display and creation
│   ├── Navbar.tsx        # Navigation bar
│   ├── PostsClient.tsx   # Client-side posts container
│   ├── ErrorBoundary.tsx # Error handling component
│   └── SupabaseProvider.tsx # Supabase context provider
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication state management hook
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client configurations
│   │   ├── client.ts     # Browser-side Supabase client
│   │   ├── server.ts     # Server-side Supabase client
│   │   └── index.ts      # Centralized exports
│   └── utils.ts          # General utility functions
├── services/              # Business logic layer
│   ├── auth.service.ts   # Authentication operations
│   ├── posts.service.ts  # Post-related operations
│   ├── comments.service.ts # Comment-related operations
│   ├── storage.service.ts # File upload operations
│   └── profile.service.ts # User profile management
└── types/                 # TypeScript type definitions
    └── index.ts          # Shared type definitions
```

### Architectural Patterns

#### 1. **Service Layer Pattern**

The application separates business logic from presentation and data access layers through dedicated service classes:

- **AuthService**: Handles all authentication operations (login, logout, user retrieval)
- **PostsService**: Manages post-related API calls (create, fetch)
- **CommentsService**: Manages comment-related API calls (create, fetch by post)
- **StorageService**: Handles image uploads to Supabase Storage
- **ProfileService**: Manages user profile synchronization

**Benefits:**
- Code reusability across components
- Easier unit testing
- Clear separation of concerns
- Improved maintainability

#### 2. **Repository Pattern (Implicit)**

Services act as repositories that abstract data access, providing a consistent interface regardless of the underlying data source.

#### 3. **Custom Hooks Pattern**

- **useAuth**: Centralizes authentication state management, providing user data, loading states, and authentication methods to components

#### 4. **Component Composition**

The UI is built from small, reusable components:
- **PostCard**: Displays individual posts with metadata
- **PostForm**: Handles post creation with image upload
- **CommentSection**: Manages comment display and creation
- **Navbar**: Provides navigation and authentication UI

#### 5. **API Routes Pattern (Next.js)**

Server-side API routes handle:
- Data validation
- Database operations via Supabase
- Authentication checks
- Error handling

### Data Flow

#### Authentication Flow

1. User clicks "Login with GitHub"
2. `AuthService.signInWithGitHub()` initiates OAuth flow
3. User is redirected to GitHub for authentication
4. GitHub redirects back to `/auth/callback`
5. Callback handler exchanges code for session token
6. User session is established
7. `useAuth` hook detects state change and updates UI

#### Post Creation Flow

1. User fills out `PostForm` component
2. If image is provided, `StorageService.uploadPostImage()` uploads to Supabase Storage
3. `PostsService.createPost()` sends POST request to `/api/posts`
4. API route validates input and user authentication
5. Post is saved to database via Supabase
6. Response is returned to client
7. `PostsClient` component refreshes post list

#### Comment Creation Flow

Similar to post creation:
1. User submits comment via `CommentSection`
2. Image upload (if provided) via `StorageService`
3. `CommentsService.createComment()` sends request to `/api/posts/[postId]/comments`
4. Server validates and saves comment
5. UI updates with new comment

### Database Schema

#### Tables

- **profiles**: User profile information
  - `id` (UUID, references auth.users)
  - `username` (TEXT)
  - `avatar_url` (TEXT, nullable)
  - `created_at`, `updated_at` (TIMESTAMP)

- **posts**: User-created posts
  - `id` (UUID, primary key)
  - `content` (TEXT, nullable)
  - `image_url` (TEXT, nullable)
  - `author_id` (UUID, references auth.users)
  - `created_at` (TIMESTAMP)

- **comments**: Comments on posts
  - `id` (UUID, primary key)
  - `content` (TEXT, required)
  - `image_url` (TEXT, nullable)
  - `post_id` (UUID, references posts)
  - `author_id` (UUID, references auth.users)
  - `created_at` (TIMESTAMP)

#### Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Policies**: 
  - Public read access for posts and comments
  - Authenticated users can create posts/comments
  - Users can only update their own profiles

## 🎯 Approach and Methodology

### Development Philosophy

1. **Type Safety First**: Full TypeScript implementation with strict typing ensures compile-time error detection and better IDE support

2. **Separation of Concerns**: Clear boundaries between:
   - Presentation (React components)
   - Business logic (Services)
   - Data access (Supabase clients)
   - API layer (Next.js routes)

3. **Component-Driven Development**: Small, focused components that are easily testable and reusable

4. **Error Handling**: Comprehensive error handling at every layer:
   - Client-side validation in services
   - Server-side validation in API routes
   - User-friendly error messages
   - Console logging for debugging

5. **Responsive Design**: Mobile-first approach using Tailwind CSS breakpoints

6. **Performance Optimization**:
   - Lazy loading of images
   - Efficient database queries with proper indexing
   - Optimized re-renders with React hooks

### Testing Strategy

- **Unit Tests**: Services, utilities, and hooks
- **Component Tests**: React components using React Testing Library
- **Integration Tests**: API routes and authentication flows
- **Mock Strategy**: External dependencies (Supabase, fetch API) are mocked for isolated testing

### Code Quality

- **ESLint**: Configured with Next.js recommended rules
- **TypeScript**: Strict mode enabled
- **Consistent Naming**: Clear, descriptive names for variables, functions, and components
- **Documentation**: Inline comments for complex logic

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **Supabase account** ([sign up here](https://supabase.com))
- **GitHub account** for OAuth setup

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd my-posts-app
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard:
- Go to **Settings** > **API**
- Copy the **Project URL** and **anon/public key**

4. **Set up Supabase Database**

Run the following SQL in the Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  image_url TEXT,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

5. **Set up Supabase Storage**

In the Supabase dashboard:

1. Go to **Storage**
2. Create two buckets:
   - `post-images` (public)
   - `comment-images` (public)
3. Configure storage policies as needed:
   - **SELECT**: Public read access
   - **INSERT**: Authenticated users only
   - **DELETE**: Users can delete their own files

6. **Configure GitHub OAuth**

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **GitHub** provider
3. Create a GitHub OAuth App:
   - Go to GitHub **Settings** > **Developer settings** > **OAuth Apps**
   - Click **New OAuth App**
   - Set **Authorization callback URL** to: `https://your-project.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
   - Paste them into Supabase GitHub provider settings

### Running the Application

#### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🧪 Testing

This project includes a comprehensive test suite using Jest and React Testing Library.

### Test Coverage

The test suite covers:

- **Services**: Unit tests for all service classes
  - `PostsService`: Post creation and retrieval
  - `CommentsService`: Comment creation and retrieval
  - `AuthService`: Authentication operations

- **Components**: Component rendering and interaction tests
  - `PostCard`: Post display and rendering
  - `Navbar`: Authentication UI and navigation

- **Hooks**: Custom hook behavior tests
  - `useAuth`: Authentication state management

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

Tests are organized in `__tests__` directories adjacent to the files they test:

```
src/
├── services/
│   ├── __tests__/
│   │   ├── posts.service.test.ts
│   │   ├── comments.service.test.ts
│   │   └── auth.service.test.ts
├── components/
│   ├── __tests__/
│   │   ├── PostCard.test.tsx
│   │   └── Navbar.test.tsx
└── hooks/
    ├── __tests__/
    │   └── useAuth.test.ts
```

### Writing Tests

When adding new features:

1. Create test files in `__tests__` directories
2. Use descriptive test names that explain the behavior being tested
3. Test both success and error cases
4. Mock external dependencies (API calls, Supabase, etc.)
5. Use React Testing Library for component tests
6. Follow the Arrange-Act-Assert pattern

### Test Configuration

- **Jest**: Configured in `jest.config.js` with Next.js integration
- **Test Setup**: Additional setup in `jest.setup.js` for DOM utilities
- **Environment**: jsdom for React component testing
- **Mocking**: External services are mocked to ensure isolated unit tests

### Example Test

```typescript
describe('PostsService', () => {
  it('should fetch all posts successfully', async () => {
    const mockPosts = [{ id: '1', content: 'Test post' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    const result = await PostsService.getAllPosts();

    expect(result.posts).toEqual(mockPosts);
    expect(result.error).toBeNull();
  });
});
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

The application is currently deployed in: https://my-posts-app-mateorios.vercel.app/


## 📄 License

This project is licensed under the MIT License.
