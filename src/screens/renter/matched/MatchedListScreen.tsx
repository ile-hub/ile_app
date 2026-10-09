import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ListScreenContainer } from '../../../components/ListScreenContainer';
import type { RenterMatchedStackParamList } from '../../../navigation/renter/RenterMatchedStack';
import { useRenterInterests, type RenterInterest } from '../../../state/RenterInterestsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterMatchedStackParamList, 'MatchedList'>;

// Properties where both sides have expressed interest. Chat is out of
// scope for now — tapping through just shows the "coming soon" stub.
export function MatchedListScreen({ navigation }: Props) {
  const { interests } = useRenterInterests();
  const matches = interests.filter((i) => i.status === 'matched');

  return (
    <ListScreenContainer<RenterInterest>
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          subtitle="Once you and a landlord are both interested, it'll show up here."
          title="No matches yet"
        />
      }
      data={matches}
      keyExtractor={(item) => item.propertyId}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('MatchedDetail', { propertyId: item.propertyId })}
        >
          <Card style={styles.card}>
            <Text style={styles.title}>Property {item.propertyId}</Text>
            <Text style={styles.subtitle}>You're matched — tap to view</Text>
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
