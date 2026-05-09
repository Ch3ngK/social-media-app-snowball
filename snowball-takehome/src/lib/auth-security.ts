export const DEMO_EMAIL = 'demo@snowball.app';
export const DEMO_PASSWORD = 'password123';
export const MAX_FAILED_PASSWORD_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type AuthMethod = 'biometric' | 'password';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function isValidDemoCredentials(email: string, password: string) {
  return (
    timingSafeEqual(normalizeEmail(email), DEMO_EMAIL) &&
    timingSafeEqual(password, DEMO_PASSWORD)
  );
}

export function formatLockoutTime(ms: number) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}
