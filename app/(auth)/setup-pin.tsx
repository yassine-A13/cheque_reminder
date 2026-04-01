import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { PinPad } from '@/features/auth/components/PinPad';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme } from '@/providers/ThemeProvider';

type Stage = 'length' | 'create' | 'confirm';

export default function SetupPinScreen() {
  const { createPin } = useAuth();
  const { colors } = useAppTheme();
  const [stage, setStage] = useState<Stage>('length');
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [saving, setSaving] = useState(false);

  const title = useMemo(() => {
    if (stage === 'length') {
      return 'Créer votre code PIN';
    }
    if (stage === 'create') {
      return 'Créez votre code PIN';
    }
    return 'Confirmez votre code PIN';
  }, [stage]);

  const subtitle = useMemo(() => {
    if (stage === 'length') {
      return 'Choisissez un code numérique à 4 ou 6 chiffres pour protéger l’application.';
    }
    if (stage === 'create') {
      return `Saisissez un code à ${pinLength} chiffres.`;
    }
    return 'Ressaisissez le même code pour finaliser la configuration.';
  }, [pinLength, stage]);

  const handleDigitPress = async (digit: string) => {
    if (currentPin.length >= pinLength || saving) {
      return;
    }

    const nextPin = `${currentPin}${digit}`;
    setCurrentPin(nextPin);

    if (nextPin.length !== pinLength) {
      return;
    }

    if (stage === 'create') {
      setFirstPin(nextPin);
      setCurrentPin('');
      setStage('confirm');
      return;
    }

    if (stage === 'confirm') {
      if (nextPin !== firstPin) {
        setCurrentPin('');
        setFirstPin('');
        setStage('create');
        Alert.alert('PIN différent', 'Les deux codes ne correspondent pas. Recommencez.');
        return;
      }

      try {
        setSaving(true);
        await createPin(nextPin);
      } catch {
        Alert.alert('Erreur', "Impossible d'enregistrer le PIN.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>

      {stage === 'length' ? (
        <View style={styles.lengthContainer}>
          {[4, 6].map((length) => {
            const isActive = pinLength === length;
            return (
              <TouchableOpacity
                key={length}
                activeOpacity={0.9}
                style={[
                  styles.lengthCard,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primarySoft : colors.card,
                  },
                ]}
                onPress={() => setPinLength(length as 4 | 6)}
              >
                <ThemedText type="subtitle">PIN {length} chiffres</ThemedText>
                <ThemedText>{length === 4 ? 'Accès rapide' : 'Protection renforcée'}</ThemedText>
              </TouchableOpacity>
            );
          })}

          <AppButton label="Continuer" onPress={() => setStage('create')} />
        </View>
      ) : (
        <PinPad
          pinLength={pinLength}
          valueLength={currentPin.length}
          onDigitPress={handleDigitPress}
          onDelete={() => setCurrentPin((previous) => previous.slice(0, -1))}
          footer={
            stage === 'confirm' ? (
              <AppButton
                variant="secondary"
                label="Recommencer"
                onPress={() => {
                  setStage('create');
                  setFirstPin('');
                  setCurrentPin('');
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
