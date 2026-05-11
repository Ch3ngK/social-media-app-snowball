import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/src/lib/auth-store';
import { PostsProvider } from './posts-store';

export function RootProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <PostsProvider>{children}</PostsProvider>
    </AuthProvider>
  );
}
