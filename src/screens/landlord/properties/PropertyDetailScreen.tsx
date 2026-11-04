import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { ErrorState, LoadingState } from '../../../components/QueryState';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { api } from '../../../lib/api';
import {
  PROPERTY_RULE_LABELS,
  formatBedrooms,
  formatRent,
  propertyName,
  propertyLocation,
} from '../../../lib/properties';
import { useApiQuery } from '../../../lib/useApiQuery';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertyDetail'>;

const STATUS_COPY = {
  draft: 'Draft — not visible to renters',
  published: 'Published — visible to renters',
  archived: 'Archived — no longer listed',
} as const;

export function PropertyDetailScreen({ navigation, route }: Props) {
  const { propertyId } = route.params;
  const { data: property, error, isLoading, reload } = useApiQuery(
    `properties/${propertyId}`,
    () => api.getProperty(propertyId),
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }
  if (!property) {
    return (
      <ScreenContainer>
        <ErrorState error={error ?? new Error('Property not found.')} onRetry={reload} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {property.status !== 'draft' ? <Text style={styles.reference}>{STATUS_COPY[property.status]}</Text> : null}
      <Text style={styles.title}>{propertyName(property)}</Text>
      <Text style={styles.subtitle}>
        {propertyLocation(property)}
        {'\n'}
        {formatBedrooms(property.bedrooms)} · {formatRent(property.rentAmount, property.currency)}
      </Text>
      {property.propertyRules.length > 0 ? (
        <View style={styles.rules}>
          {property.propertyRules.map((rule) => (
            <View key={rule} style={styles.rule}>
              <Text style={styles.ruleText}>{PROPERTY_RULE_LABELS[rule]}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
    marginTop: 8,
  },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  rule: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ruleText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  card: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 12 },
  rowPressed: { opacity: 0.7 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '600' },
});
