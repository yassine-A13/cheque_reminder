import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/providers/ThemeProvider';

type Accent = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

type StatCardProps = {
  label: string;
  value: string;
  accent: Accent;
  hint?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, accent, hint, style }: StatCardProps) {
  const { colors } = useAppTheme();
  const palette =
    accent === 'primary' ? { background: colors.primarySoft, text: colors.primary } : colors[accent];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      <View style={[styles.badge, { backgroundColor: palette.background }]}>
        <ThemedText type="caption" style={{ color: palette.text }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="subtitle">{value}</ThemedText>
      {hint ? (
        <ThemedText type="caption" style={{ color: colors.textMuted }}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
