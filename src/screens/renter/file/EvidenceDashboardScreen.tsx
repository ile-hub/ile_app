import { ErrorState, LoadingState } from '../../../components/QueryState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS, useEvidenceCatalogue } from '../../../lib/trustPillars';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'EvidenceDashboard'>;

// Catalogue counts are not evidence-submission counts. Persistence is Phase 2.
export function EvidenceDashboardScreen({ navigation }: Props) {
  const catalogue = useEvidenceCatalogue();
  return (
    <ScreenContainer>
      <Text style={styles.intro}>
        Tell your story through Affordability, Reliability, Community and Stability. Choose the
        evidence that fits your circumstances; no single document is required.
      </Text>
      {catalogue.isLoading ? <LoadingState /> : catalogue.error ? <ErrorState error={catalogue.error} onRetry={catalogue.reload} /> : null}
      {TRUST_PILLARS.map((pillar) => (
        <Pressable
          key={pillar.id}
          onPress={() => navigation.navigate('EvidenceCategory', { pillar: pillar.id })}
          style={({ pressed }) => pressed && styles.rowPressed}
        >
          <Card style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons color={colors.accent} name={pillar.icon} size={20} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.pillarLabel}>{pillar.label}</Text>
              <Text style={styles.pillarStatus}>Saving evidence is not available yet</Text>
              {catalogue.data && !catalogue.error ? <Text style={styles.pillarStatus}>{catalogue.data.filter((option) => option.pillar === pillar.id).length} optional evidence types</Text> : null}
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  rowPressed: { opacity: 0.7 },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowText: { flex: 1 },
  pillarLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  pillarStatus: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
