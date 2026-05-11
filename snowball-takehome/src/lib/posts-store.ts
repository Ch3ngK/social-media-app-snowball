import { Platform } from 'react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import type { Post } from '@/src/types/Post';

type CreatePostInput = Omit<Post, 'id'>;

type PostsContextValue = {
  isHydrated: boolean;
  posts: Post[];
  addPost: (post: CreatePostInput) => Promise<Post>;
};

type PostsStoreModule = {
  PostsProvider: (props: PropsWithChildren) => ReactElement;
  usePosts: () => PostsContextValue;
};

const postsStoreModule: PostsStoreModule =
  Platform.OS === 'web'
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ? require('./posts-store.web')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require('./posts-store.native');

export const PostsProvider = postsStoreModule.PostsProvider;
export const usePosts = postsStoreModule.usePosts;
