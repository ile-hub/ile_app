import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, loading = false, disabled, variant = 'primary', ...props }: Props) {
  const unavailable = disabled || loading;
  const secondary = variant === 'secondary';
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...props.accessibilityState, disabled: !!unavailable, busy: loading }}
      disabled={unavailable}
      style={({ pressed }) => [styles.button, secondary && styles.secondary,
        pressed && !unavailable && styles.pressed, unavailable && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={secondary ? colors.accent : colors.onAccent} /> : null}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.pill,
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center',
    minHeight: 52, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  secondary: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
  label: { color: colors.onAccent, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondaryLabel: { color: colors.accent },
});
