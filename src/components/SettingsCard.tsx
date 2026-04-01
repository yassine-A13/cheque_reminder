import { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/providers/ThemeProvider';

function SettingsAction({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.action, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <ThemedText>{label}</ThemedText>
      <ThemedText type="caption" style={{ color: colors.primary }}>
        {value}
      </ThemedText>
    </TouchableOpacity>
  );
}

type SettingsCardComponent = ((props: PropsWithChildren<{ title: string; description: string }>) => ReactElement) & {
  Action: typeof SettingsAction;
};

function SettingsCardBase({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText>{description}</ThemedText>
      </View>
      {children}
    </View>
  );
}

export const SettingsCard = SettingsCardBase as typeof SettingsCardBase & {
  Action: typeof SettingsAction;
};

SettingsCard.Action = SettingsAction;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  action: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
