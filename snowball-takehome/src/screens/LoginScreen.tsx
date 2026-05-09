import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import {
  DEMO_EMAIL,
  formatLockoutTime,
  isValidDemoCredentials,
  normalizeEmail,
  type AuthMethod,
} from "@/src/lib/auth-security";
import {
  getAuthThrottleState,
  getRemainingLockoutMs,
  registerFailedPasswordAttempt,
  resetAuthThrottleState,
  type AuthThrottleState,
} from "@/src/lib/secure-storage";

type LoginScreenProps = {
  onLoginSuccess: (email: string, authMethod: AuthMethod) => Promise<void>;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [throttleState, setThrottleState] = useState<AuthThrottleState>({
    failedAttempts: 0,
    lockedUntil: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function hydrateThrottleState() {
      const storedThrottleState = await getAuthThrottleState();

      if (!isMounted) {
        return;
      }

      setThrottleState(storedThrottleState);
    }

    void hydrateThrottleState();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBiometricLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        setError("Biometric authentication is not supported on this device.");
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        setError("No biometrics are set up on this device.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to Snowball Social",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        await resetAuthThrottleState();
        setThrottleState({
          failedAttempts: 0,
          lockedUntil: null,
        });
        await onLoginSuccess(DEMO_EMAIL, "biometric");
      } else {
        setError("Authentication failed or was cancelled.");
      }
    } catch {
      setError("Something went wrong during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    setError("");

    const trimmedEmail = normalizeEmail(email);
    const remainingLockoutMs = getRemainingLockoutMs(throttleState);

    if (remainingLockoutMs > 0) {
      setError(`Too many failed attempts. Try again in ${formatLockoutTime(remainingLockoutMs)}.`);
      return;
    }

    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isValidDemoCredentials(trimmedEmail, password)) {
      const nextThrottleState = await registerFailedPasswordAttempt();
      const nextRemainingLockoutMs = getRemainingLockoutMs(nextThrottleState);

      setThrottleState(nextThrottleState);
      setError(
        nextRemainingLockoutMs > 0
          ? `Too many failed attempts. Try again in ${formatLockoutTime(nextRemainingLockoutMs)}.`
          : "Invalid email or password."
      );
      return;
    }

    setLoading(true);

    try {
      await resetAuthThrottleState();
      setThrottleState({
        failedAttempts: 0,
        lockedUntil: null,
      });
      await onLoginSuccess(trimmedEmail, "password");
    } catch {
      setError("Unable to save your session securely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>❄️</Text>
      <Text style={styles.title}>Snowball Social</Text>
      <Text style={styles.subtitle}>Login to view and create posts.</Text>

      <View style={styles.card}>
        <Pressable
          style={styles.button}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login with Biometrics</Text>
          )}
        </Pressable>

        <Text style={styles.orText}>
          {Platform.OS === "web"
            ? "Or use the local email fallback"
            : "Or use email/password instead"}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void handlePasswordLogin();
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Login with Email</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.note}>
        Demo credentials: {DEMO_EMAIL} / password123
      </Text>
      <Text style={styles.note}>
        Sessions expire after 12 hours, and password attempts are rate-limited locally.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    gap: 12,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111827",
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    color: "#DC2626",
    textAlign: "center",
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
