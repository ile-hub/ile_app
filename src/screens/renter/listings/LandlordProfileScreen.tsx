import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../../components/ScreenContainer';
import type { RenterListingsStackParamList } from '../../../navigation/renter/RenterListingsStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterListingsStackParamList, 'LandlordProfile'>;

// Renter-facing view of a landlord. Deliberately minimal — display name,
// company name (if set), and verification status only, nothing else.
// There's no landlord-profile-by-id API yet, so this shows the intended
// layout in its empty form.
export function LandlordProfileScreen({ route }: Props) {
  void route.params.landlordId;

  return (
    <ScreenContainer>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>?</Text>
      </View>
      <Text style={styles.name}>Landlord name not available yet</Text>
      <Text style={styles.company}>Company name, if set, will show here.</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Verification status not available yet</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginTop: 24,
    width: 80,
  },
  avatarInitial: { color: colors.accentPressed, fontSize: 32, fontWeight: '800' },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  company: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
});
