// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://my-posts-app-mateorios.vercel.app/',
    href: 'https://my-posts-app-mateorios.vercel.app/',
    pathname: '/',
  },
  writable: true,
})
