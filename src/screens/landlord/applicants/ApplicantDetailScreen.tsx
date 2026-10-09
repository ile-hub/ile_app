import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import type { LandlordApplicantsStackParamList } from '../../../navigation/landlord/LandlordApplicantsStack';
import { useLandlordApplicants } from '../../../state/LandlordApplicantsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordApplicantsStackParamList, 'ApplicantDetail'>;

// Trust profile and compatibility are shown together here, not as separate
// screens, per the earlier design decision. Exactly two real actions —
// "Interested" and "Not a fit" — no "shortlist"/third state; either one
// removes this applicant from the active list and returns to it (see
// LandlordApplicantsProvider for what each maps to once the API exists).
export function ApplicantDetailScreen({ navigation, route }: Props) {
  const { applicantId } = route.params;
  const { applicants, decline, expressInterest } = useLandlordApplicants();
  const applicant = applicants.find((a) => a.id === applicantId);

  function handleInterested() {
    expressInterest(applicantId);
    navigation.goBack();
  }

  function handleNotAFit() {
    decline(applicantId);
    navigation.goBack();
  }

  return (
    <ScreenContainer>
      <Text style={styles.reference}>Applicant {applicantId}</Text>
      {applicant ? (
        <>
          <Text style={styles.title}>{applicant.name}</Text>
          <Text style={styles.subtitle}>{applicant.propertyName}</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Applicant details aren't connected yet</Text>
          <Text style={styles.subtitle}>
            Once the applications API exists, this will show the renter's full profile alongside
            their trust profile and compatibility with this property.
          </Text>
        </>
      )}

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
        <Pressable onPress={handleNotAFit} style={styles.rejectButton}>
          <Text style={styles.rejectButtonText}>Not a fit</Text>
        </Pressable>
        <Pressable onPress={handleInterested} style={styles.interestedButton}>
          <Text style={styles.interestedButtonText}>Interested</Text>
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
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  rejectButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  rejectButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  interestedButton: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  interestedButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
