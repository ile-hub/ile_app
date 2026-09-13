import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import type { RenterListingsStackParamList } from '../../../navigation/renter/RenterListingsStack';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterListingsStackParamList, 'PropertyDetail'>;

// Reachable once ListingsScreen has real cards to tap into (propertyId is
// already wired through the stack for that). Until the properties API
// exists, there's no property to render, so this shows the intended
// layout — compatibility breakdown per pillar + Apply — in its empty form.
export function PropertyDetailScreen({ route }: Props) {
  const { propertyId } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.reference}>Property {propertyId}</Text>
      <Text style={styles.title}>Property details aren't connected yet</Text>
      <Text style={styles.subtitle}>
        Once the listings API exists, this screen will show full property info and how well it
        matches your trust profile, pillar by pillar.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Compatibility breakdown</Text>
        {TRUST_PILLARS.map((pillar) => (
          <View key={pillar.id} style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>{pillar.label}</Text>
            <Text style={styles.pillarValue}>—</Text>
          </View>
        ))}
      </Card>

      <Pressable disabled style={[styles.applyButton, styles.applyButtonDisabled]}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </Pressable>
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
  applyButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  applyButtonDisabled: { backgroundColor: colors.accentMuted },
  applyButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
