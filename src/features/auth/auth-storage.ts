import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { assertValidPin } from '@/features/auth/pin-utils';

const PIN_KEY = 'auth.pin.payload';
const BIOMETRIC_KEY = 'auth.biometric.enabled';

type StoredPinPayload = {
  salt: string;
  hash: string;
  length: number;
};

async function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function getStoredPin(): Promise<StoredPinPayload | null> {
  const raw = await SecureStore.getItemAsync(PIN_KEY);
  return raw ? (JSON.parse(raw) as StoredPinPayload) : null;
}

export async function savePin(pin: string) {
  assertValidPin(pin);
  const salt = `${Date.now()}-${Math.random()}`;
  const payload: StoredPinPayload = {
    salt,
    hash: await hashPin(pin, salt),
    length: pin.length,
  };

  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(payload));
}

export async function verifyPin(pin: string) {
  if (!/^\d+$/.test(pin)) {
    return false;
  }

  const payload = await getStoredPin();

  if (!payload) {
    return false;
  }

  const computed = await hashPin(pin, payload.salt);
  return computed === payload.hash;
}

export async function getBiometricEnabled() {
  const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
  return value === 'true';
}

export async function setStoredBiometricEnabled(enabled: boolean) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, String(enabled));
}

export async function canUseBiometrics() {
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return hardware && enrolled;
}

export async function authenticateWithBiometrics() {
  return LocalAuthentication.authenticateAsync({
    promptMessage: 'Déverrouiller Cheque Reminder',
    fallbackLabel: 'Utiliser le PIN',
    cancelLabel: 'Annuler',
    disableDeviceFallback: false,
  });
}
