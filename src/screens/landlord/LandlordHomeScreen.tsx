import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLandlordVerification } from '../../auth/LandlordVerificationProvider';
import { useAuth } from '../../auth/AuthProvider';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import type { LandlordHomeStackParamList } from '../../navigation/landlord/LandlordHomeStack';
import type { LandlordTabParamList } from '../../navigation/landlord/LandlordTabNavigator';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<LandlordHomeStackParamList, 'LandlordHomeMain'>;

// Dashboard, not a deep stack — summarizes and hands off to the
// Properties/Applicants/Profile tabs rather than pushing its own screens.
export function LandlordHomeScreen({ navigation }: Props) {
  const { displayName } = useAuth();
  const { status } = useLandlordVerification();
  const parentNav = navigation.getParent<BottomTabNavigationProp<LandlordTabParamList>>();

  // No properties/applicants API yet, so these are always 0 for now — but
  // the header action (Manage/Review) is already wired to hide whenever
  // there's nothing to act on, not just while it's unconnected.
  const propertyCount = 0;
  const applicantCount = 0;

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>
        {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
      </Text>

      {status !== 'verified' ? (
        <Pressable onPress={() => parentNav?.navigate('LandlordProfileTab')}>
          <Card style={styles.nudgeCard}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={20} />
            <View style={styles.nudgeText}>
              <Text style={styles.nudgeTitle}>Verification incomplete</Text>
              <Text style={styles.nudgeSubtitle}>
                {status === 'pending'
                  ? 'Your registration is pending review.'
                  : 'Verify your identity to publish properties.'}
              </Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </Card>
        </Pressable>
      ) : null}

      <Pressable onPress={() => parentNav?.navigate('LandlordPropertiesTab')}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your properties</Text>
            {propertyCount > 0 ? <Text style={styles.cardLink}>Manage</Text> : null}
          </View>
          <Text style={styles.emptyText}>No properties yet — add one to get started.</Text>
        </Card>
      </Pressable>

      <Pressable onPress={() => parentNav?.navigate('LandlordApplicantsTab')}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>New applicants</Text>
            {applicantCount > 0 ? <Text style={styles.cardLink}>Review</Text> : null}
          </View>
          <Text style={styles.emptyText}>No new applicants right now.</Text>
        </Card>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 20 },
  nudgeCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.danger,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  nudgeText: { flex: 1 },
  nudgeTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  nudgeSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  card: { marginBottom: 14 },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
});
