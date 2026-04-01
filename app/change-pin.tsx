import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { PinPad } from '@/features/auth/components/PinPad';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/ThemeProvider';

type Stage = 'verify-current' | 'choose-length' | 'create-next' | 'confirm-next';

export default function ChangePinScreen() {
  const router = useRouter();
  const { authReady, hasPin, isAuthenticated, changePin, getPinLength, verifyPinValue } = useAuth();
  const { colors } = useAppTheme();
  const [stage, setStage] = useState<Stage>('verify-current');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [currentPinVerified, setCurrentPinVerified] = useState('');
  const [pinLength, setPinLength] = useState<4 | 6>(getPinLength() as 4 | 6);
  const [nextPin, setNextPin] = useState('');
  const [draftPin, setDraftPin] = useState('');
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => {
    switch (stage) {
      case 'verify-current':
        return 'Changer le code PIN';
      case 'choose-length':
        return 'Choisissez le nouveau format';
      case 'create-next':
        return 'Saisissez le nouveau PIN';
      default:
        return 'Confirmez le nouveau PIN';
    }
  }, [stage]);

  const subtitle = useMemo(() => {
    switch (stage) {
      case 'verify-current':
        return 'Entrez votre code actuel avant de définir un nouveau PIN.';
      case 'choose-length':
        return 'Vous pouvez conserver un format 4 chiffres ou passer à 6 chiffres.';
      case 'create-next':
        return `Créez un nouveau code à ${pinLength} chiffres.`;
      default:
        return 'Ressaisissez le même code pour finaliser la modification.';
    }
  }, [pinLength, stage]);

  if (!authReady) {
    return null;
  }

  if (!hasPin || !isAuthenticated) {
    return <Redirect href="/unlock" />;
  }

  const handleDigitPress = async (digit: string) => {
    if (busy) {
      return;
    }

    if (stage === 'verify-current') {
      if (currentPinInput.length >= getPinLength()) {
        return;
      }

      const next = `${currentPinInput}${digit}`;
      setCurrentPinInput(next);

      if (next.length !== getPinLength()) {
        return;
      }

      try {
        setBusy(true);
        const success = await verifyPinValue(next);

        if (!success) {
          setCurrentPinInput('');
          Alert.alert('PIN incorrect', 'Le code actuel est invalide.');
          return;
        }

        setCurrentPinVerified(next);
        setCurrentPinInput('');
        setStage('choose-length');
      } finally {
        setBusy(false);
      }

      return;
    }

    if (draftPin.length >= pinLength) {
      return;
    }

    const next = `${draftPin}${digit}`;
    setDraftPin(next);

    if (next.length !== pinLength) {
      return;
    }

    if (stage === 'create-next') {
      setNextPin(next);
      setDraftPin('');
      setStage('confirm-next');
      return;
    }

    if (next !== nextPin) {
      setDraftPin('');
      setNextPin('');
      setStage('create-next');
      Alert.alert('PIN différent', 'Les deux nouveaux codes ne correspondent pas.');
      return;
    }

    try {
      setBusy(true);
      const success = await changePin(currentPinVerified, next);

      if (!success) {
        Alert.alert('Erreur', 'La vérification du PIN actuel a expiré. Recommencez.');
        setStage('verify-current');
        setCurrentPinVerified('');
        setDraftPin('');
        setNextPin('');
        return;
      }

      Alert.alert('PIN modifié', 'Votre code PIN a été mis à jour.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>

      {stage === 'choose-length' ? (
        <View style={styles.lengthContainer}>
          {[4, 6].map((length) => {
            const active = pinLength === length;
            return (
              <TouchableOpacity
                key={length}
                activeOpacity={0.9}
                style={[
                  styles.lengthCard,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primarySoft : colors.card,
                  },
                ]}
                onPress={() => setPinLength(length as 4 | 6)}
              >
                <ThemedText type="subtitle">PIN {length} chiffres</ThemedText>
                <ThemedText>{length === 4 ? 'Rapide à saisir' : 'Plus résistant au shoulder surfing'}</ThemedText>
              </TouchableOpacity>
            );
          })}

          <AppButton label="Continuer" onPress={() => setStage('create-next')} />
        </View>
      ) : (
        <PinPad
          pinLength={stage === 'verify-current' ? getPinLength() : pinLength}
          valueLength={stage === 'verify-current' ? currentPinInput.length : draftPin.length}
          onDigitPress={handleDigitPress}
          onDelete={() => {
            if (stage === 'verify-current') {
              setCurrentPinInput((previous) => previous.slice(0, -1));
              return;
            }

            setDraftPin((previous) => previous.slice(0, -1));
          }}
          footer={
            stage === 'confirm-next' ? (
              <AppButton
                variant="secondary"
                label="Recommencer"
                onPress={() => {
                  setDraftPin('');
                  setNextPin('');
                  setStage('create-next');
                }}
              />
            ) : null
          }
        />
      )}
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
  lengthContainer: {
    gap: 16,
  },
  lengthCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
});
