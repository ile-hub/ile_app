import { colors } from '../theme/colors';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

type FormInputProps = TextInputProps & {
  error?: string | null;
  label: string;
  onRightActionPress?: () => void;
  rightActionLabel?: string;
};

export function FormInput({
  error,
  label,
  onRightActionPress,
  rightActionLabel,
  style,
  ...inputProps
}: FormInputProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightActionLabel && onRightActionPress ? (
          <Pressable accessibilityRole="button" onPress={onRightActionPress}>
            <Text style={styles.rightAction}>{rightActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, error ? styles.inputError : null, style]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  labelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  rightAction: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});
