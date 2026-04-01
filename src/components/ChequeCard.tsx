import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { ThemedText } from '@/components/ThemedText';
import { Cheque } from '@/core/types/cheque';
import { useAppTheme } from '@/providers/ThemeProvider';
import { formatDisplayDate } from '@/utils/date';
import { formatAmount } from '@/utils/format';

type ChequeCardProps = {
  cheque: Cheque;
  onPress: () => void;
};

export function ChequeCard({ cheque, onPress }: ChequeCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <ThemedText type="subtitle">{cheque.beneficiary}</ThemedText>
          <ThemedText type="caption" style={{ color: colors.textMuted }}>
            Chèque n° {cheque.chequeNumber}
          </ThemedText>
        </View>
        <StatusBadge status={cheque.status} />
      </View>

      <View style={styles.footer}>
        <View style={styles.column}>
          <ThemedText type="caption" style={{ color: colors.textMuted }}>
            Montant
          </ThemedText>
          <ThemedText>{formatAmount(cheque.amount)}</ThemedText>
        </View>
        <View style={styles.column}>
          <ThemedText type="caption" style={{ color: colors.textMuted }}>
            Échéance
          </ThemedText>
          <ThemedText>{formatDisplayDate(cheque.dueDate)}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  column: {
    gap: 4,
  },
});
