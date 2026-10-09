import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { LandlordMatchedStackParamList } from '../../../navigation/landlord/LandlordMatchedStack';
import { useLandlordApplicants, type Applicant } from '../../../state/LandlordApplicantsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordMatchedStackParamList, 'MatchedList'>;

// Applicants where both sides have expressed interest. Chat is out of
// scope for now — tapping through just shows the "coming soon" stub.
export function MatchedListScreen({ navigation }: Props) {
  const { applicants } = useLandlordApplicants();
  const matches = applicants.filter((a) => a.status === 'matched');

  return (
    <ListScreenContainer<Applicant>
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          subtitle="Once you and an applicant are both interested, it'll show up here."
          title="No matches yet"
        />
      }
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('MatchedDetail', { applicantId: item.id })}
        >
          <Card style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.propertyName} — you're matched</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
