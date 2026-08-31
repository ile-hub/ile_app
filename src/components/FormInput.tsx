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
          placeholderTextColor="#8A817A"
          style={[styles.input, error ? styles.inputError : null]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  labelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#312823', fontSize: 13, fontWeight: '600' },
  rightAction: { color: '#9D361A', fontSize: 13, fontWeight: '700' },
  input: {
    backgroundColor: '#FFFCF8',
    borderColor: '#CFC4BA',
    borderRadius: 18,
    borderWidth: 1,
    color: '#1D1815',
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  inputError: { borderColor: '#A73B2B' },
  error: { color: '#A73B2B', fontSize: 12 },
});
