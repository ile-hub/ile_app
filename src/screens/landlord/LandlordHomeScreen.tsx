import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';

export function LandlordHomeScreen() {
  const { displayName } = useAuth();

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>
        {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
      </Text>
      <Text style={styles.subtitle}>
        Your landlord dashboard will summarize your properties and applicants here.
      </Text>
      <View style={styles.placeholder} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 10 },
  placeholder: { flex: 1 },
});
