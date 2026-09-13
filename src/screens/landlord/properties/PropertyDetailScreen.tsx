import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '../../../components/Card';
import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertyDetail'>;

// Reachable once PropertiesListScreen has real rows to tap into.
export function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.reference}>Property {propertyId}</Text>
      <Text style={styles.title}>Property details aren't connected yet</Text>
      <Text style={styles.subtitle}>
        Once the properties API exists, this will show the full listing with edit access.
      </Text>

      <Pressable
        onPress={() => navigation.navigate('AddEditProperty', { propertyId })}
        style={({ pressed }) => pressed && styles.rowPressed}
      >
        <Card style={styles.card}>
          <Ionicons color={colors.accent} name="create-outline" size={20} />
          <Text style={styles.rowLabel}>Edit details</Text>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
        </Card>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('PropertyPreferences', { propertyId })}
        style={({ pressed }) => pressed && styles.rowPressed}
      >
        <Card style={styles.card}>
          <Ionicons color={colors.accent} name="options-outline" size={20} />
          <Text style={styles.rowLabel}>Preferences & rules</Text>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
        </Card>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  reference: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 24 },
  card: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 12 },
  rowPressed: { opacity: 0.7 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '600' },
});
