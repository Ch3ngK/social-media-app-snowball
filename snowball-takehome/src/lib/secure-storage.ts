import * as SecureStore from 'expo-secure-store';

import {
  LOCKOUT_DURATION_MS,
  MAX_FAILED_PASSWORD_ATTEMPTS,
  SESSION_TTL_MS,
  type AuthMethod,
} from '@/src/lib/auth-security';

const SESSION_KEY = 'auth_session';
const AUTH_THROTTLE_KEY = 'auth_throttle';

export type StoredSession = {
  email: string;
  token: string;
  authMethod: AuthMethod;
  createdAt: number;
  expiresAt: number;
};

export type AuthThrottleState = {
  failedAttempts: number;
  lockedUntil: number | null;
};

function getDefaultThrottleState(): AuthThrottleState {
  return {
    failedAttempts: 0,
    lockedUntil: null,
  };
}

function parseSession(rawSession: string) {
  const parsed = JSON.parse(rawSession) as Partial<StoredSession>;

  if (
    typeof parsed.email !== 'string' ||
    typeof parsed.token !== 'string' ||
    (parsed.authMethod !== 'biometric' && parsed.authMethod !== 'password') ||
    typeof parsed.createdAt !== 'number' ||
    typeof parsed.expiresAt !== 'number'
  ) {
    return null;
  }

  return parsed as StoredSession;
}

function parseThrottleState(rawState: string) {
  const parsed = JSON.parse(rawState) as Partial<AuthThrottleState>;

  if (
    typeof parsed.failedAttempts !== 'number' ||
    (parsed.lockedUntil !== null && typeof parsed.lockedUntil !== 'number')
  ) {
    return null;
  }

  return parsed as AuthThrottleState;
}

export async function saveSession(session: StoredSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getSession() {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = parseSession(rawSession);

    if (!parsedSession) {
      await clearSession();
      return null;
    }

    if (parsedSession.expiresAt <= Date.now()) {
      await clearSession();
      return null;
    }

    return parsedSession;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function createSession(email: string, token: string, authMethod: AuthMethod): StoredSession {
  const createdAt = Date.now();

  return {
    email,
    token,
    authMethod,
    createdAt,
    expiresAt: createdAt + SESSION_TTL_MS,
  };
}

export function getRemainingLockoutMs(state: AuthThrottleState, now = Date.now()) {
  if (!state.lockedUntil || state.lockedUntil <= now) {
    return 0;
  }

  return state.lockedUntil - now;
}

export async function getAuthThrottleState(now = Date.now()) {
  const rawState = await SecureStore.getItemAsync(AUTH_THROTTLE_KEY);

  if (!rawState) {
    return getDefaultThrottleState();
  }

  try {
    const parsedState = parseThrottleState(rawState);

    if (!parsedState) {
      await resetAuthThrottleState();
      return getDefaultThrottleState();
    }

    if (parsedState.lockedUntil && parsedState.lockedUntil <= now) {
      await resetAuthThrottleState();
      return getDefaultThrottleState();
    }

    return parsedState;
  } catch {
    await resetAuthThrottleState();
    return getDefaultThrottleState();
  }
}

export async function registerFailedPasswordAttempt(now = Date.now()) {
  const currentState = await getAuthThrottleState(now);
  const nextAttempts = currentState.failedAttempts + 1;
  const shouldLock = nextAttempts >= MAX_FAILED_PASSWORD_ATTEMPTS;
  const nextState: AuthThrottleState = {
    failedAttempts: nextAttempts,
    lockedUntil: shouldLock ? now + LOCKOUT_DURATION_MS : null,
  };

  await SecureStore.setItemAsync(AUTH_THROTTLE_KEY, JSON.stringify(nextState), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });

  return nextState;
}

export async function resetAuthThrottleState() {
  await SecureStore.deleteItemAsync(AUTH_THROTTLE_KEY);
}
