import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { PinPad } from '@/features/auth/components/PinPad';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function UnlockScreen() {
  const {
    biometricEnabled,
    biometricSupported,
    getPinLength,
    unlockWithBiometrics,
    unlockWithPin,
  } = useAuth();
  const { colors } = useAppTheme();
  const pinLength = getPinLength();
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (biometricEnabled && biometricSupported) {
      void handleBiometricPress();
    }
  }, [biometricEnabled, biometricSupported]);

  const handleBiometricPress = async () => {
    if (busy) {
      return;
    }

    try {
      setBusy(true);
      const success = await unlockWithBiometrics();

      if (!success) {
        Alert.alert('Biométrie indisponible', 'Utilisez votre PIN pour continuer.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDigitPress = async (digit: string) => {
    if (pin.length >= pinLength || busy) {
      return;
    }

    const nextPin = `${pin}${digit}`;
    setPin(nextPin);

    if (nextPin.length !== pinLength) {
      return;
    }

    try {
      setBusy(true);
      const success = await unlockWithPin(nextPin);

      if (!success) {
        setPin('');
        Alert.alert('PIN incorrect', 'Le code saisi est invalide.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText type="title">Déverrouillage</ThemedText>
        <ThemedText style={styles.subtitle}>
          Accédez à vos chèques avec votre code PIN. La biométrie reste optionnelle.
        </ThemedText>
      </View>

      <PinPad
        pinLength={pinLength}
        valueLength={pin.length}
        onDigitPress={handleDigitPress}
        onDelete={() => setPin((previous) => previous.slice(0, -1))}
        footer={
          biometricEnabled && biometricSupported ? (
            <AppButton
              variant="secondary"
              label="Se connecter avec biométrie"
              onPress={handleBiometricPress}
            />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  subtitle: {
    lineHeight: 22,
  },
});
