import { StyleSheet, View } from 'react-native';

import { ChequeStatus } from '@/core/types/cheque';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/providers/ThemeProvider';

export function StatusBadge({ status }: { status: ChequeStatus }) {
  const { colors } = useAppTheme();
  const palette =
    status === 'Encaissé'
      ? colors.success
      : status === 'Annulé'
        ? colors.danger
        : status === 'Expiré'
          ? colors.warning
          : { background: colors.primarySoft, text: colors.primary };

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <ThemedText type="caption" style={{ color: palette.text }}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
});
