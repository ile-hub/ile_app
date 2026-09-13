import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { ScreenContainer } from '../../../components/ScreenContainer';
import type { RenterListingsStackParamList } from '../../../navigation/renter/RenterListingsStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<RenterListingsStackParamList, 'ApplicationDetail'>;

// Reachable once MyApplicationsScreen has real rows to tap into.
export function ApplicationDetailScreen({ route }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.reference}>Application {route.params.applicationId}</Text>
      <Text style={styles.title}>Application details aren't connected yet</Text>
      <Text style={styles.subtitle}>
        Once the applications API exists, this will show the property, timeline, and any messages
        tied to this application.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reference: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
