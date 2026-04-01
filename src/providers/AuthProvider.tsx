import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import {
  authenticateWithBiometrics,
  canUseBiometrics,
  getBiometricEnabled,
  getStoredPin,
  savePin,
  setStoredBiometricEnabled,
  verifyPin,
} from '@/features/auth/auth-storage';

type AuthContextValue = {
  authReady: boolean;
  hasPin: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  biometricSupported: boolean;
  createPin: (pin: string) => Promise<void>;
  verifyPinValue: (pin: string) => Promise<boolean>;
  changePin: (currentPin: string, nextPin: string) => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  lock: () => void;
  getPinLength: () => number;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authReady, setAuthReady] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [pinLength, setPinLength] = useState(4);

  useEffect(() => {
    const load = async () => {
      const [storedPin, storedBiometricEnabled, supported] = await Promise.all([
        getStoredPin(),
        getBiometricEnabled(),
        canUseBiometrics(),
      ]);

      setHasPin(Boolean(storedPin));
      setPinLength(storedPin?.length ?? 4);
      setBiometricEnabledState(storedBiometricEnabled);
      setBiometricSupported(supported);
      setAuthReady(true);
    };

    void load();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authReady,
      hasPin,
      isAuthenticated,
      biometricEnabled,
      biometricSupported,
      createPin: async (pin) => {
        await savePin(pin);
        setHasPin(true);
        setPinLength(pin.length);
        setIsAuthenticated(true);
      },
      verifyPinValue: async (pin) => verifyPin(pin),
      changePin: async (currentPin, nextPin) => {
        const verified = await verifyPin(currentPin);

        if (!verified) {
          return false;
        }

        await savePin(nextPin);
        setPinLength(nextPin.length);
        return true;
      },
      unlockWithPin: async (pin) => {
        const success = await verifyPin(pin);

        if (success) {
          setIsAuthenticated(true);
        }

        return success;
      },
      unlockWithBiometrics: async () => {
        const result = await authenticateWithBiometrics();

        if (result.success) {
          setIsAuthenticated(true);
          return true;
        }

        return false;
      },
      setBiometricEnabled: async (enabled) => {
        if (enabled) {
          const supported = await canUseBiometrics();

          if (!supported) {
            setBiometricSupported(false);
            return false;
          }

          const result = await authenticateWithBiometrics();

          if (!result.success) {
            return false;
          }
        }

        await setStoredBiometricEnabled(enabled);
        setBiometricEnabledState(enabled);
        return true;
      },
      lock: () => setIsAuthenticated(false),
      getPinLength: () => pinLength,
    }),
    [authReady, biometricEnabled, biometricSupported, hasPin, isAuthenticated, pinLength],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
