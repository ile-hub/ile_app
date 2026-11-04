import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Property, PropertyRule } from '@yourorg/ile-shared-types';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfile } from '../../../auth/ProfileProvider';
import { FormInput } from '../../../components/FormInput';
import { ErrorState, LoadingState } from '../../../components/QueryState';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { api, isVerificationRequired } from '../../../lib/api';
import { PROPERTY_RULE_LABELS, PROPERTY_RULE_OPTIONS } from '../../../lib/properties';
import { useApiQuery } from '../../../lib/useApiQuery';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import type { LandlordTabParamList } from '../../../navigation/landlord/LandlordTabNavigator';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'AddEditProperty'>;

type Action = 'draft' | 'publish' | 'archive';

function toggleRule(current: PropertyRule[], rule: PropertyRule): PropertyRule[] {
  return current.includes(rule) ? current.filter((r) => r !== rule) : [...current, rule];
}

// Create (POST /properties) or edit (PATCH /properties/:id), then optionally
// publish (POST .../publish) or archive (POST .../archive). Saving a draft is
// never gated, since drafts aren't visible to renters.
//
// The publish gate follows the API, not local state: ile-api only blocks
// publishing when it runs with REQUIRE_VERIFICATION=true. When publish comes
// back with that verification error, the screen switches to the existing
// locked "verify first" state — unverified (explanation + link out) or
// pending (wait copy, nothing to do), using the server profile status.
export function AddEditPropertyScreen({ navigation, route }: Props) {
  const { profile } = useProfile();
  const verificationStatus = profile?.kind === 'landlord' ? profile.verification.registrationStatus : null;
  const parentNav = navigation.getParent<BottomTabNavigationProp<LandlordTabParamList>>();

  // Set once a new property has been created here (e.g. publish was
  // blocked after the draft saved), so later saves update it instead of
  // creating a duplicate.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const propertyId = route.params.propertyId ?? createdId;
  const isEditing = Boolean(route.params.propertyId);

  const existing = useApiQuery<Property | null>(`properties/${route.params.propertyId ?? 'new'}`, () =>
    route.params.propertyId ? api.getProperty(route.params.propertyId) : Promise.resolve(null),
  );

  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [bedrooms, setBedrooms] = useState(1);
  const [rent, setRent] = useState('');
  const [rules, setRules] = useState<PropertyRule[]>([]);

  const [pending, setPending] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationBlocked, setVerificationBlocked] = useState(false);

  // Prefill once from the loaded property — not on every refocus refetch,
  // which would overwrite in-progress edits.
  const prefilled = useRef(false);
  useEffect(() => {
    const property = existing.data;
    if (!property || prefilled.current) return;
    prefilled.current = true;
    setAddressLine1(property.addressLine1);
    setCity(property.city);
    setPostcode(property.postcode);
    setBedrooms(property.bedrooms);
    setRent(String(property.rentAmount));
    setRules(property.propertyRules);
  }, [existing.data]);

  if (isEditing && existing.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }
  if (isEditing && !existing.data) {
    return (
      <ScreenContainer>
        <ErrorState
          error={existing.error ?? new Error('Property not found.')}
          onRetry={existing.reload}
        />
      </ScreenContainer>
    );
  }

  const status = existing.data?.status ?? 'draft';
  const canPublish = !verificationBlocked && pending === null;

  function validate(): { rentAmount: number } | null {
    const rentAmount = Number(rent.replace(/[,£\s]/g, ''));
    if (!addressLine1.trim() || !city.trim() || !postcode.trim()) {
      setError('Address, city and postcode are required.');
      return null;
    }
    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      setError('Enter a monthly rent greater than 0.');
      return null;
    }
    return { rentAmount };
  }

  async function save(): Promise<Property | null> {
    const valid = validate();
    if (!valid) return null;
    const body = {
      addressLine1: addressLine1.trim(),
      city: city.trim(),
      postcode: postcode.trim().toUpperCase(),
      bedrooms,
      rentAmount: valid.rentAmount,
      propertyRules: rules,
    };
    const saved = propertyId
      ? await api.updateProperty(propertyId, body)
      : await api.createProperty(body);
    if (!propertyId) setCreatedId(saved.id);
    return saved;
  }

  async function run(action: Action) {
    setError(null);
    setPending(action);
    try {
      if (action === 'archive') {
        await api.archiveProperty(propertyId!);
      } else {
        const saved = await save();
        if (!saved) return;
        if (action === 'publish') {
          await api.publishProperty(saved.id);
        }
      }
      navigation.goBack();
    } catch (err) {
      if (isVerificationRequired(err)) {
        // The draft itself saved; only publishing is blocked.
        setVerificationBlocked(true);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setPending(null);
    }
  }

  if (status === 'archived') {
    return (
      <ScreenContainer>
        <Text style={styles.title}>Edit property</Text>
        <View style={styles.gateNotice}>
          <Text style={styles.gateNoticeText}>
            This listing is archived. Archived listings can’t be edited or republished.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

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

      <Text style={styles.sectionTitle}>Practical details to discuss</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 12 }}>Share relevant details about the home. These choices do not replace getting to know a renter or considering their circumstances.</Text>
      <View style={styles.chipRow}>
        {PROPERTY_RULE_OPTIONS.map((rule) => {
          const selected = rules.includes(rule);
          return (
            <Pressable
              key={rule}
              onPress={() => setRules((current) => toggleRule(current, rule))}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {PROPERTY_RULE_LABELS[rule]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {verificationBlocked && verificationStatus === 'pending' ? (
        <View style={styles.gateNotice}>
          <Text style={styles.gateNoticeText}>
            Verification pending — you’ll be able to publish once it’s confirmed.
          </Text>
        </View>
      ) : verificationBlocked ? (
        <View style={styles.gateNotice}>
          <Text style={styles.gateNoticeText}>Verify your identity to publish a live listing</Text>
          <Pressable onPress={() => parentNav?.navigate('LandlordProfileTab')}>
            <Text style={styles.gateNoticeLink}>Go to verification</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          disabled={pending !== null}
          onPress={() => run('draft')}
          style={[styles.button, styles.draftButton]}
        >
          <Text style={styles.draftButtonText}>
            {pending === 'draft' ? 'Saving…' : status === 'published' ? 'Save changes' : 'Save draft'}
          </Text>
        </Pressable>
        {status === 'published' ? (
          <Pressable
            disabled={pending !== null}
            onPress={() => run('archive')}
            style={[styles.button, styles.draftButton]}
          >
            <Text style={styles.draftButtonText}>
              {pending === 'archive' ? 'Archiving…' : 'Archive'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!canPublish}
            onPress={() => run('publish')}
            style={[
              styles.button,
              styles.publishButton,
              !canPublish && styles.publishButtonDisabled,
            ]}
          >
            {verificationBlocked ? (
              <Ionicons color={colors.textMuted} name="lock-closed-outline" size={16} />
            ) : null}
            <Text
              style={[styles.publishButtonText, !canPublish && styles.publishButtonTextDisabled]}
            >
              {pending === 'publish' ? 'Publishing…' : 'Publish'}
            </Text>
          </Pressable>
        )}
      </View>

      {isEditing && status === 'draft' ? (
        <Pressable disabled={pending !== null} onPress={() => run('archive')}>
          <Text style={styles.archiveLink}>
            {pending === 'archive' ? 'Archiving…' : 'Archive this draft'}
          </Text>
        </Pressable>
      ) : null}
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
  stepperValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
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
  error: { color: colors.danger, fontSize: 13, marginTop: 20, textAlign: 'center' },
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
  archiveLink: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
});
