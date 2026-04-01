import { StyleSheet, View } from 'react-native';

import { FilterChip } from '@/components/FilterChip';
import { ThemedText } from '@/components/ThemedText';
import { SortDirection } from '@/core/types/cheque';

type SortPickerProps<T extends string> = {
  options: Array<{ label: string; value: T }>;
  selected: T;
  direction: SortDirection;
  onChange: (value: T) => void;
  onToggleDirection: (direction: SortDirection) => void;
};

export function SortPicker<T extends string>({
  options,
  selected,
  direction,
  onChange,
  onToggleDirection,
}: SortPickerProps<T>) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Tri</ThemedText>
      <View style={styles.options}>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={selected === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
      <View style={styles.options}>
        <FilterChip label="Ascendant" active={direction === 'asc'} onPress={() => onToggleDirection('asc')} />
        <FilterChip label="Descendant" active={direction === 'desc'} onPress={() => onToggleDirection('desc')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
