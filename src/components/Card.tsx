import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

export function Card({
  children,
  style,
  title,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return title ? <View style={styles.section}><Text accessibilityRole="header" style={styles.heading}>{title}</Text>{content}</View> : content;
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { color: colors.textPrimary, fontSize: 18, lineHeight: 25, fontWeight: '700' },
  card: {
    backgroundColor: colors.surfaceSage,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.xl,
  },
});
