import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordMatchedStackParamList } from '../../../navigation/landlord/LandlordMatchedStack';
import { useLandlordApplicants } from '../../../state/LandlordApplicantsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordMatchedStackParamList, 'MatchedDetail'>;

// Chat is explicitly out of scope right now — this is a stub, not real
// messaging.
export function MatchedDetailScreen({ route }: Props) {
  const { applicantId } = route.params;
  const { applicants } = useLandlordApplicants();
  const applicant = applicants.find((a) => a.id === applicantId);

  return (
    <ScreenContainer>
      <Text style={styles.reference}>
        {applicant ? `${applicant.name} — ${applicant.propertyName}` : `Applicant ${applicantId}`}
      </Text>
      <View style={styles.stub}>
        <Ionicons color={colors.accent} name="heart" size={28} />
        <Text style={styles.title}>You're matched</Text>
        <Text style={styles.subtitle}>Chat coming soon.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reference: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  stub: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 12 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 6 },
});
