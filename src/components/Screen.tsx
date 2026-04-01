import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  centered?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, scrollable, centered, contentContainerStyle }: ScreenProps) {
  const { colors } = useAppTheme();

  const content = (
    <View
      style={[
        styles.content,
        centered && styles.centered,
        { backgroundColor: colors.background },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {scrollable ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
