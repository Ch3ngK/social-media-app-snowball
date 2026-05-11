import type { PropsWithChildren } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { initializePostsDb } from '@/src/db/postsDb';
import { AuthProvider } from '@/src/lib/auth-store';
import { PostsProvider } from './posts-store';

export function RootProviders({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName="snowball.db" onInit={initializePostsDb}>
      <AuthProvider>
        <PostsProvider>{children}</PostsProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}
