import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'PropertyPreferences'>;

const HOUSEHOLD_TYPES = ['Single', 'Couple', 'Family', 'Sharers'] as const;
const TENANCY_LENGTHS = ['6 months', '12 months', '18+ months'] as const;

// Per-property matching preferences (maps to landlord_preferences.property_id
// server-side, once that exists) — who's a good fit, not the property's own
// rules (those live as structured chips on AddEditPropertyScreen, since
// they're an attribute of the listing itself, not a matching filter).
// Editable locally; not synced yet.
export function PropertyPreferencesScreen({ route }: Props) {
  void route.params.propertyId;
  const [householdType, setHouseholdType] = useState<(typeof HOUSEHOLD_TYPES)[number] | null>(
    null,
  );
  const [tenancyLength, setTenancyLength] = useState<(typeof TENANCY_LENGTHS)[number] | null>(
    null,
  );

  return (
    <ScreenContainer>
      <Text style={styles.sectionTitle}>Household type</Text>
      <View style={styles.chipRow}>
        {HOUSEHOLD_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => setHouseholdType(type)}
            style={[styles.chip, householdType === type && styles.chipSelected]}
          >
            <Text style={[styles.chipText, householdType === type && styles.chipTextSelected]}>
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Tenancy length</Text>
      <View style={styles.chipRow}>
        {TENANCY_LENGTHS.map((length) => (
          <Pressable
            key={length}
            onPress={() => setTenancyLength(length)}
            style={[styles.chip, tenancyLength === length && styles.chipSelected]}
          >
            <Text style={[styles.chipText, tenancyLength === length && styles.chipTextSelected]}>
              {length}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
      <Text style={styles.footnote}>
        Preferences aren't synced to this property's account yet — they'll reset if you leave
        this screen.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: colors.surface },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 28,
    minHeight: 56,
  },
  saveButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 12, marginTop: 10, textAlign: 'center' },
});
