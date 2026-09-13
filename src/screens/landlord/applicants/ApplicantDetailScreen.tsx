import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import type { LandlordApplicantsStackParamList } from '../../../navigation/landlord/LandlordApplicantsStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordApplicantsStackParamList, 'ApplicantDetail'>;

// Reachable once ApplicantsListScreen has real rows to tap into. Trust
// profile and compatibility are shown together here, not as separate
// screens, per the earlier design decision.
export function ApplicantDetailScreen({ route }: Props) {
  const { applicantId } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.reference}>Applicant {applicantId}</Text>
      <Text style={styles.title}>Applicant details aren't connected yet</Text>
      <Text style={styles.subtitle}>
        Once the applications API exists, this will show the renter's full profile alongside
        their trust profile and compatibility with this property.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Trust profile & compatibility</Text>
        {TRUST_PILLARS.map((pillar) => (
          <View key={pillar.id} style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>{pillar.label}</Text>
            <Text style={styles.pillarValue}>—</Text>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Pressable disabled style={[styles.actionButton, styles.actionButtonDisabled]}>
          <Text style={styles.actionButtonText}>Shortlist</Text>
        </Pressable>
        <Pressable disabled style={[styles.actionButton, styles.actionButtonDisabled]}>
          <Text style={styles.actionButtonText}>Accept</Text>
        </Pressable>
        <Pressable disabled style={[styles.actionButton, styles.rejectButtonDisabled]}>
          <Text style={styles.rejectButtonText}>Reject</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reference: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: { marginTop: 24 },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  pillarRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  pillarLabel: { color: colors.textPrimary, fontSize: 14 },
  pillarValue: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 24 },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  actionButtonDisabled: { backgroundColor: colors.accentMuted },
  actionButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  rejectButtonDisabled: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  rejectButtonText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
});
