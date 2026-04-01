import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

type TextProps = PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  type?: 'body' | 'title' | 'subtitle' | 'caption';
}>;

export function ThemedText({ children, style, type = 'body' }: TextProps) {
  const { colors } = useAppTheme();

  return (
    <Text style={[styles.base, styles[type], { color: colors.text }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  body: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
  },
});
