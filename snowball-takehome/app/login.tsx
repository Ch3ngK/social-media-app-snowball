import { Redirect } from 'expo-router';

import { useAuth } from '@/src/lib/auth-store';
import LoginScreen from '@/src/screens/LoginScreen';

export default function LoginRoute() {
  const { isAuthenticated, isHydrated, login } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <LoginScreen
      onLoginSuccess={async (email, authMethod) => {
        await login(email, authMethod);
      }}
    />
  );
}
