import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Post, SeedPost } from '@/src/types/Post';

type SeedFile = {
  posts: SeedPost[];
};

type CreatePostInput = Omit<Post, 'id'>;

type PostsContextValue = {
  isHydrated: boolean;
  posts: Post[];
  addPost: (post: CreatePostInput) => Promise<Post>;
};

const STORAGE_KEY = 'snowball.posts';
const seedData = require('@/src/data/seed.json') as SeedFile;
const PostsContext = createContext<PostsContextValue | null>(null);

function normalizeText(value: string | undefined) {
  if (!value) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function getSeedPosts(): Post[] {
  return seedData.posts.map((post, index) => ({
    id: `seed-${index}`,
    title: normalizeText(post.title) ?? '',
    author: normalizeText(post.author) ?? '',
    description: normalizeText(post.description),
    image: post.image,
  }));
}

function loadPostsFromStorage(): Post[] {
  if (typeof window === 'undefined') {
    return getSeedPosts();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    const seedPosts = getSeedPosts();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return seedPosts;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Post[];

    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }
  } catch {
    // Fall back to seed data when persisted JSON is invalid.
  }

  const seedPosts = getSeedPosts();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
  return seedPosts;
}

export function PostsProvider({ children }: PropsWithChildren) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setPosts(loadPostsFromStorage());
    setIsHydrated(true);
  }, []);

  const value = useMemo(
    () => ({
      isHydrated,
      posts,
      addPost: async (post: CreatePostInput) => {
        const nextPost: Post = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: post.title,
          author: post.author,
          description: post.description,
          image: post.image,
        };

        setPosts((currentPosts) => {
          const nextPosts = [nextPost, ...currentPosts];

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPosts));
          }

          return nextPosts;
        });

        return nextPost;
      },
    }),
    [isHydrated, posts]
  );

  return createElement(PostsContext.Provider, { value }, children);
}

export function usePosts() {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider.');
  }

  return context;
}
