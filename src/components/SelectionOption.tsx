import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

export function SelectionOption({ label, selected, onPress, disabled = false }: {
  disabled?: boolean;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled }} disabled={disabled}
      onPress={onPress} style={({ pressed }) => [styles.row, selected && styles.selected,
        pressed && styles.pressed]}>
      <Ionicons name={selected ? 'checkbox' : 'square-outline'} color={colors.accent} size={24} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border,
    borderRadius: radius.input, borderWidth: 1, flexDirection: 'row', gap: spacing.md,
    minHeight: 52, padding: spacing.lg },
  selected: { backgroundColor: colors.surfaceSage, borderColor: colors.accent },
  pressed: { opacity: 0.8 },
  label: { color: colors.textPrimary, flex: 1, fontSize: 15, lineHeight: 22 },
});
