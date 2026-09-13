import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'TrustProfile'>;

// The synthesis view: confidence per pillar, risk indicators, suitability
// insights, next steps. All of it is derived from submitted evidence, and
// nothing has been submitted yet (see EvidenceDashboardScreen's note), so
// confidence reads as "Not yet assessed" and the next steps are simply
// "get started on each pillar" rather than fabricated risk output.
export function TrustProfileScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.sectionTitle}>Confidence by pillar</Text>
      <Card style={styles.card}>
        {TRUST_PILLARS.map((pillar, index) => (
          <View
            key={pillar.id}
            style={[styles.pillarRow, index === 0 && styles.pillarRowFirst]}
          >
            <Ionicons color={colors.accent} name={pillar.icon} size={18} />
            <Text style={styles.pillarLabel}>{pillar.label}</Text>
            <Text style={styles.pillarValue}>Not yet assessed</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Risk indicators</Text>
      <Text style={styles.emptyText}>None to show — assessment needs at least one pillar started.</Text>

      <Text style={styles.sectionTitle}>Suitability insights</Text>
      <Text style={styles.emptyText}>None to show yet.</Text>

      <Text style={styles.sectionTitle}>Next steps</Text>
      {TRUST_PILLARS.map((pillar) => (
        <Pressable
          key={pillar.id}
          onPress={() => navigation.navigate('EvidenceCategory', { pillar: pillar.id })}
          style={({ pressed }) => pressed && styles.rowPressed}
        >
          <Card style={styles.stepCard}>
            <Text style={styles.stepText}>Get started on {pillar.label}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  card: { gap: 0, padding: 0 },
  pillarRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pillarRowFirst: { borderTopWidth: 0 },
  pillarLabel: { color: colors.textPrimary, flex: 1, fontSize: 14, fontWeight: '600' },
  pillarValue: { color: colors.textMuted, fontSize: 13 },
  emptyText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  rowPressed: { opacity: 0.7 },
  stepCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
