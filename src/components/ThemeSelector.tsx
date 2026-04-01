import { StyleSheet, View } from 'react-native';

import { FilterChip } from '@/components/FilterChip';
import { ThemePreference } from '@/constants/theme';

type ThemeSelectorProps = {
  selected: ThemePreference;
  onChange: (value: ThemePreference) => void | Promise<void>;
};

const options: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Système', value: 'system' },
  { label: 'Clair', value: 'light' },
  { label: 'Sombre', value: 'dark' },
];

export function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          active={selected === option.value}
          onPress={() => void onChange(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
