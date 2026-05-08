import { Redirect } from 'expo-router';

import { useAuth } from '@/src/lib/auth-store';

export default function Index() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}
