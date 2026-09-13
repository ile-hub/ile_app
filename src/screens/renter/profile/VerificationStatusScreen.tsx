import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { colors } from '../../../theme/colors';

// Identity / right-to-rent status, with a re-verify path once expired.
// No verification provider is wired up yet, so this shows the real
// "not verified" state rather than a fabricated pass/fail.
export function VerificationStatusScreen() {
  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <View style={styles.statusRow}>
          <Ionicons color={colors.textMuted} name="alert-circle-outline" size={22} />
          <Text style={styles.statusText}>Not verified</Text>
        </View>
        <Text style={styles.subtitle}>
          Identity and right-to-rent verification isn't connected yet. Once it is, your status
          and any re-verification steps will show here.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 8 },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  statusText: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 12 },
});
