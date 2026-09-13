import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../../lib/trustPillars';
import type { RenterFileStackParamList } from '../../../navigation/renter/RenterFileStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterFileStackParamList, 'EvidenceDashboard'>;

// Per-pillar view of what's submitted vs. open. There's no working
// GET /evidence integration yet (ile-api's endpoint needs a renter_profiles
// row provisioned server-side first — see RenterFileScreen's old note), so
// every pillar honestly reads as "0 submitted" rather than a fetched count.
export function EvidenceDashboardScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.navigate('TrustProfile')}
        >
          <Text style={styles.headerAction}>Trust Profile</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <ScreenContainer>
      <Text style={styles.intro}>
        Your file collects evidence across four pillars. Real names are shown here — it's your
        own data.
      </Text>
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
              <Text style={styles.pillarStatus}>Nothing submitted yet</Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerAction: { color: colors.accent, fontSize: 14, fontWeight: '700' },
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
