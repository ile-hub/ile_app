import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { EVIDENCE_PATHWAYS, TRUST_PILLARS } from '../../../lib/trustPillars';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'EvidenceCategory'>;

export function EvidenceCategoryScreen({ navigation, route }: Props) {
  const { pillar } = route.params;
  const meta = TRUST_PILLARS.find((p) => p.id === pillar);
  const pathways = EVIDENCE_PATHWAYS[pillar];

  useLayoutEffect(() => {
    navigation.setOptions({ title: meta?.label ?? 'Pillar' });
  }, [navigation, meta]);

  return (
    <ScreenContainer>
      <Text style={styles.subtitle}>{meta?.description}</Text>
      <Text style={styles.sectionTitle}>Available pathways</Text>
      {pathways.map((pathwayType) => (
        <Pressable
          key={pathwayType}
          onPress={() => navigation.navigate('EvidenceUpload', { pillar, pathwayType })}
          style={({ pressed }) => pressed && styles.rowPressed}
        >
          <Card style={styles.card}>
            <Text style={styles.pathwayLabel}>{pathwayType}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Card>
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Submitted</Text>
      <Text style={styles.emptyText}>Nothing submitted for this pillar yet.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowPressed: { opacity: 0.7 },
  pathwayLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  emptyText: { color: colors.textMuted, fontSize: 14 },
});
