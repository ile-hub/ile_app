import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLandlordVerification } from '../../../auth/LandlordVerificationProvider';
import { FormInput } from '../../../components/FormInput';
import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import type { LandlordTabParamList } from '../../../navigation/landlord/LandlordTabNavigator';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'AddEditProperty'>;

const RULE_OPTIONS = ['No smoking', 'No pets', 'Sharers OK'] as const;

function toggleRule(current: string[], rule: string): string[] {
  return current.includes(rule) ? current.filter((r) => r !== rule) : [...current, rule];
}

// The one screen in this pillar that actually gates on something real:
// publishing is blocked until landlord verification is at least
// submitted/pending (there's no automated LRS lookup for MVP — see
// LandlordVerificationProvider — so "verified" only ever happens manually).
// Saving as a draft is never gated, since it isn't visible to renters.
//
// Publish has three distinct visual/copy states rather than a plain
// enabled/disabled toggle, because this is where that verification rule
// actually becomes visible to the user instead of just an API check:
// unverified (locked + explanation + link out), pending (locked + "this is
// temporary" copy, no link — there's nothing to do but wait), verified
// (a plain active button, no extra messaging).
export function AddEditPropertyScreen({ navigation, route }: Props) {
  const isEditing = Boolean(route.params.propertyId);
  const { status } = useLandlordVerification();
  const parentNav = navigation.getParent<BottomTabNavigationProp<LandlordTabParamList>>();

  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [bedrooms, setBedrooms] = useState(1);
  const [rent, setRent] = useState('');
  const [rules, setRules] = useState<string[]>([]);

  const canPublish = status === 'verified';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{isEditing && 'Edit property'}</Text>

      <FormInput
        label="Address line 1"
        onChangeText={setAddressLine1}
        placeholder="123 Example Street"
        value={addressLine1}
      />
      <View style={styles.spacer} />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <FormInput label="City" onChangeText={setCity} placeholder="City" value={city} />
        </View>
        <View style={styles.rowItem}>
          <FormInput
            autoCapitalize="characters"
            label="Postcode"
            onChangeText={setPostcode}
            placeholder="Postcode"
            value={postcode}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bedrooms</Text>
      <View style={styles.stepper}>
        <Pressable
          disabled={bedrooms <= 0}
          onPress={() => setBedrooms((n) => Math.max(0, n - 1))}
          style={[styles.stepperButton, bedrooms <= 0 && styles.stepperButtonDisabled]}
        >
          <Ionicons color={colors.textPrimary} name="remove-outline" size={20} />
        </Pressable>
        <Text style={styles.stepperValue}>{bedrooms}</Text>
        <Pressable
          onPress={() => setBedrooms((n) => Math.min(20, n + 1))}
          style={styles.stepperButton}
        >
          <Ionicons color={colors.textPrimary} name="add-outline" size={20} />
        </Pressable>
      </View>

      <View style={styles.rentRow}>
        <View style={styles.rentInput}>
          <FormInput
            keyboardType="number-pad"
            label="Monthly rent"
            onChangeText={setRent}
            placeholder="0"
            value={rent}
          />
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyBadgeText}>GBP</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Property rules</Text>
      <View style={styles.chipRow}>
        {RULE_OPTIONS.map((rule) => {
          const selected = rules.includes(rule);
          return (
            <Pressable
              key={rule}
              onPress={() => setRules((current) => toggleRule(current, rule))}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{rule}</Text>
            </Pressable>
          );
        })}
      </View>

      {status === 'unverified' ? (
        <View style={styles.gateNotice}>
          <Text style={styles.gateNoticeText}>Verify your identity to publish a live listing</Text>
          <Pressable onPress={() => parentNav?.navigate('LandlordProfileTab')}>
            <Text style={styles.gateNoticeLink}>Go to verification</Text>
          </Pressable>
        </View>
      ) : status === 'pending' ? (
        <View style={styles.gateNotice}>
          <Text style={styles.gateNoticeText}>
            Verification pending — you'll be able to publish once it's confirmed.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.draftButton]}>
          <Text style={styles.draftButtonText}>Save draft</Text>
        </Pressable>
        <Pressable
          disabled={!canPublish}
          style={[styles.button, styles.publishButton, !canPublish && styles.publishButtonDisabled]}
        >
          {!canPublish ? (
            <Ionicons color={colors.textMuted} name="lock-closed-outline" size={16} />
          ) : null}
          <Text style={[styles.publishButtonText, !canPublish && styles.publishButtonTextDisabled]}>
            Publish
          </Text>
        </Pressable>
      </View>
      
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 20 },
  spacer: { height: 16 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  stepper: { alignItems: 'center', flexDirection: 'row', gap: 18 },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stepperButtonDisabled: { opacity: 0.4 },
  stepperValue: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  rentRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 12, marginTop: 16 },
  rentInput: { flex: 1 },
  currencyBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: 14,
    marginBottom: 3,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  currencyBadgeText: { color: colors.accentPressed, fontSize: 14, fontWeight: '700' },
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
  gateNotice: {
    backgroundColor: colors.background,
    borderColor: colors.danger,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    padding: 14,
  },
  gateNoticeText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  gateNoticeLink: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  button: {
    alignItems: 'center',
    borderRadius: 28,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 56,
  },
  draftButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 },
  draftButtonText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  publishButton: { backgroundColor: colors.accent },
  publishButtonDisabled: { backgroundColor: colors.border },
  publishButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  publishButtonTextDisabled: { color: colors.textMuted },
  
});
