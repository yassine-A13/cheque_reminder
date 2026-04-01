import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/providers/ThemeProvider';

type UrgentChequesBannerProps = {
  count: number;
  onPress: () => void;
};

export function UrgentChequesBanner({ count, onPress }: UrgentChequesBannerProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.warning.background, borderColor: colors.border }]}>
      <View style={styles.content}>
        <ThemedText type="subtitle" style={{ color: colors.warning.text }}>
          Échéance urgente
        </ThemedText>
        <ThemedText style={{ color: colors.warning.text }}>
          {count === 1
            ? '1 chèque arrive à échéance dans les 48 prochaines heures.'
            : `${count} chèques arrivent à échéance dans les 48 prochaines heures.`}
        </ThemedText>
      </View>
      <AppButton variant="secondary" compact label="Voir les urgents" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  content: {
    gap: 8,
  },
});
