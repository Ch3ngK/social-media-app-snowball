import { createContext, createElement, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { loadSeedPosts } from '@/src/db/postsDb';
import type { Post } from '@/src/types/Post';

type CreatePostInput = Omit<Post, 'id'>;

type PostsContextValue = {
  posts: Post[];
  addPost: (post: CreatePostInput) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: PropsWithChildren) {
  const [posts, setPosts] = useState<Post[]>(() => loadSeedPosts());

  const value = useMemo(
    () => ({
      posts,
      addPost: (post: CreatePostInput) => {
        setPosts((currentPosts) => [
          {
            ...post,
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          },
          ...currentPosts,
        ]);
      },
    }),
    [posts]
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
