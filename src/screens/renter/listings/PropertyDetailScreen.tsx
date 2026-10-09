import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import type { RenterListingsStackParamList } from '../../../navigation/renter/RenterListingsStack';
import { useRenterInterests } from '../../../state/RenterInterestsProvider';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterListingsStackParamList, 'PropertyDetail'>;

// Reachable once ListingsScreen has real cards to tap into (propertyId is
// already wired through the stack for that). Until the properties API
// exists, there's no property to render, so this shows the intended
// layout — compatibility breakdown per pillar + the mutual-interest button
// — in its empty form. The button has exactly three real states (none,
// pending, matched) — no "applied"/"shortlisted" wording anywhere. A
// declined interest is deliberately indistinguishable from never having
// expressed one: no rejection styling, it just quietly allows expressing
// interest again (see RenterInterestsProvider).
export function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const { expressInterest, getInterestForProperty } = useRenterInterests();
  const interest = getInterestForProperty(propertyId);
  const status = interest?.status === 'declined' ? undefined : interest?.status;

  return (
    <ScreenContainer>
      <Text style={styles.reference}>Property {propertyId}</Text>
      <Text style={styles.title}>Property details aren't connected yet</Text>
      <Text style={styles.subtitle}>
        Once the listings API exists, this screen will show full property info and how well it
        matches your trust profile, pillar by pillar.
      </Text>

      <Pressable
        onPress={() =>
          navigation.navigate('LandlordProfile', { landlordId: `${propertyId}-landlord` })
        }
        style={({ pressed }) => pressed && styles.rowPressed}
      >
        <Card style={styles.card}>
          <Ionicons color={colors.accent} name="person-circle-outline" size={20} />
          <Text style={styles.rowLabel}>View landlord profile</Text>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
        </Card>
      </Pressable>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Compatibility breakdown</Text>
        {TRUST_PILLARS.map((pillar) => (
          <View key={pillar.id} style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>{pillar.label}</Text>
            <Text style={styles.pillarValue}>—</Text>
          </View>
        ))}
      </Card>

      {status === 'matched' ? (
        <Card style={styles.matchedCard}>
          <Text style={styles.matchedTitle}>You're matched</Text>
          <Text style={styles.matchedSubtitle}>Chat coming soon.</Text>
        </Card>
      ) : (
        <Pressable
          disabled={status === 'pending'}
          onPress={() => expressInterest(propertyId)}
          style={[styles.interestButton, status === 'pending' && styles.interestButtonPending]}
        >
          <Text style={styles.interestButtonText}>Interested</Text>
        </Pressable>
      )}
      {status === 'pending' ? (
        <Text style={styles.pendingFootnote}>Waiting to hear back.</Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reference: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  card: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 14 },
  rowPressed: { opacity: 0.7 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '600' },
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
  interestButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 56,
  },
  interestButtonPending: { backgroundColor: colors.accentMuted },
  interestButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  pendingFootnote: { color: colors.textMuted, fontSize: 12, marginTop: 10, textAlign: 'center' },
  matchedCard: { alignItems: 'center', marginTop: 10 },
  matchedTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  matchedSubtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
});
