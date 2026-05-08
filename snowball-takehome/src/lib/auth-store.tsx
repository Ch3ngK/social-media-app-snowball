import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { clearSession, getSession, saveSession, type StoredSession } from '@/src/lib/secure-storage';

type AuthContextValue = {
  isHydrated: boolean;
  isAuthenticated: boolean;
  session: StoredSession | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createToken() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const storedSession = await getSession();

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
      login: async (email: string) => {
        const nextSession = {
          email,
          token: createToken(),
        };

        await saveSession(nextSession);
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
