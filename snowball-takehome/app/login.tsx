import { router } from 'expo-router';

import { useAuth } from '@/src/lib/auth-store';
import LoginScreen from '@/src/screens/LoginScreen';

export default function LoginRoute() {
  const { isAuthenticated, isHydrated, login } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <LoginScreen
      onLoginSuccess={async (email) => {
        await login(email);
        router.replace('/(tabs)');
      }}
    />
  );
}
