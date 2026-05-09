import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import { type AuthMethod } from '@/src/lib/auth-security';
import { clearSession, createSession, getSession, saveSession, type StoredSession } from '@/src/lib/secure-storage';

type AuthContextValue = {
  isHydrated: boolean;
  isAuthenticated: boolean;
  session: StoredSession | null;
  login: (email: string, authMethod: AuthMethod) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createToken() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function verifyBiometricSession() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Re-authenticate to unlock Snowball Social',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use device passcode',
  });

  return result.success;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const storedSession = await getSession();

        if (storedSession?.authMethod === 'biometric') {
          const isVerified = await verifyBiometricSession();

          if (!isVerified) {
            await clearSession();

            if (isMounted) {
              setSession(null);
            }

            return;
          }
        }

        if (isMounted) {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isHydrated,
      isAuthenticated: session !== null,
      session,
      login: async (email: string, authMethod: AuthMethod) => {
        const nextSession = createSession(email, createToken(), authMethod);

        await saveSession({
          email,
          token: nextSession.token,
          authMethod,
          createdAt: nextSession.createdAt,
          expiresAt: nextSession.expiresAt,
        });
        setSession(nextSession);
      },
      logout: async () => {
        await clearSession();
        setSession(null);
      },
    }),
    [isHydrated, session]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
