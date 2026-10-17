import type { Verification, CheckStatus } from '../lib/phase1Types';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/tokens';

// Text always carries the meaning; colour alone never indicates a status.
export function StatusBadge({ label, tone = 'neutral' }: {
  label: string;
  tone?: 'neutral' | 'highlight';
}) {
  return (
    <View style={[styles.badge, tone === 'highlight' && styles.highlight]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', backgroundColor: colors.accentMuted, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  highlight: { backgroundColor: colors.delight },
  label: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
});

export function ProfileVerification({ verification }: {
  verification: Verification & { registrationStatus?: CheckStatus };
}) {
  const demo = verification.mode === 'demo';
  return <View style={{ gap: 8 }}>
    {demo ? <StatusBadge label="Demo / mock verification · synthetic profile" tone="highlight" /> : null}
    <StatusBadge label={`${demo ? 'Demo ' : ''}Identity: ${verification.identityStatus}`} />
    <StatusBadge label={`${demo ? 'Demo ' : ''}Photo: ${verification.photoStatus}`} />
    {verification.registrationStatus ? <StatusBadge label={`${demo ? 'Demo ' : ''}Registration: ${verification.registrationStatus}`} /> : null}
  </View>;
}
