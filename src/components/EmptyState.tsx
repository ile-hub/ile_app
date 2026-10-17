import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { Button } from './Button';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

// A list or screen with nothing to show yet (no properties, no applicants,
// no matches...). Says so plainly, so it's obvious this is a real "nothing
// here yet" and not a bug. Also the shell for ErrorState.
// actionLabel/onAction are optional — pass both together when the empty
// state is a normal first-time state with an obvious next step (e.g. "Add
// a property"), not just a passive placeholder.
export function EmptyState({ actionLabel, icon, onAction, subtitle, title }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.accent} name={icon} size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <View style={{ marginTop: 24 }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 20,
    width: 64,
  },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
});
