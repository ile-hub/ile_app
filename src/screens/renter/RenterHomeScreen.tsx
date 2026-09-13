import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TRUST_PILLARS } from '../../lib/trustPillars';
import type { RenterHomeStackParamList } from '../../navigation/renter/RenterHomeStack';
import type { RenterTabParamList } from '../../navigation/renter/RenterTabNavigator';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RenterHomeStackParamList, 'RenterHomeMain'>;

// Dashboard, deliberately not a deep stack (see the renter IA breakdown) —
// it only summarizes and hands off to the Listings/File tabs, never pushes
// its own detail screens.
export function RenterHomeScreen({ navigation }: Props) {
  const { displayName } = useAuth();
  const parentNav = navigation.getParent<BottomTabNavigationProp<RenterTabParamList>>();

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>
        {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
      </Text>

      <Pressable onPress={() => parentNav?.navigate('RenterFileTab')}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Trust profile</Text>
            <Text style={styles.cardLink}>View file</Text>
          </View>
          {TRUST_PILLARS.map((pillar) => (
            <View key={pillar.id} style={styles.pillarRow}>
              <Text style={styles.pillarLabel}>{pillar.label}</Text>
              <Text style={styles.pillarValue}>Not yet assessed</Text>
            </View>
          ))}
        </Card>
      </Pressable>

      <Pressable onPress={() => parentNav?.navigate('RenterListingsTab')}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top matches</Text>
            <Text style={styles.cardLink}>Browse</Text>
          </View>
          <Text style={styles.emptyText}>No matches yet — check back once listings connect.</Text>
        </Card>
      </Pressable>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Alerts</Text>
        <Text style={styles.emptyText}>Nothing to show right now.</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 20 },
  card: { marginBottom: 14 },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  pillarRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pillarLabel: { color: colors.textPrimary, fontSize: 14 },
  pillarValue: { color: colors.textMuted, fontSize: 13 },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
});
