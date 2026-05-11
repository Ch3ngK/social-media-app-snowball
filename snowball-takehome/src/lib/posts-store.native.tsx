import { createContext, createElement, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createPost, getPosts } from '@/src/db/postsDb';
import type { Post } from '@/src/types/Post';

type CreatePostInput = Omit<Post, 'id'>;

type PostsContextValue = {
  isHydrated: boolean;
  posts: Post[];
  addPost: (post: CreatePostInput) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydratePosts() {
      try {
        const storedPosts = await getPosts(db);

        if (isMounted) {
          setPosts(storedPosts);
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydratePosts();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const value = useMemo(
    () => ({
      isHydrated,
      posts,
      addPost: async (post: CreatePostInput) => {
        const nextPost = await createPost(db, post);

        setPosts((currentPosts) => [nextPost, ...currentPosts]);
      },
    }),
    [db, isHydrated, posts]
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
