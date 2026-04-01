import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/providers/ThemeProvider';

type PinPadProps = {
  pinLength: number;
  valueLength: number;
  onDigitPress: (digit: string) => void;
  onDelete: () => void;
  footer?: ReactNode;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export function PinPad({ pinLength, valueLength, onDigitPress, onDelete, footer }: PinPadProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: pinLength }).map((_, index) => (
          <View
            key={`pin-dot-${index}`}
            style={[
              styles.dot,
              {
                backgroundColor: index < valueLength ? colors.primary : 'transparent',
                borderColor: colors.primary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {keys.map((key, index) => {
          if (!key) {
            return <View key={`pin-empty-${index}`} style={styles.keyWrapper} />;
          }

          const isDelete = key === 'delete';
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.85}
              style={[styles.key, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => (isDelete ? onDelete() : onDigitPress(key))}
            >
              {isDelete ? (
                <Ionicons name="backspace-outline" size={24} color={colors.text} />
              ) : (
                <ThemedText type="subtitle">{key}</ThemedText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  keyWrapper: {
    width: 84,
    height: 64,
  },
  key: {
    width: 84,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
