import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLandlordVerification } from '../../../auth/LandlordVerificationProvider';
import { Card } from '../../../components/Card';
import { FormInput } from '../../../components/FormInput';
import { ScreenContainer } from '../../../components/ScreenContainer';
import type { LandlordPropertiesStackParamList } from '../../../navigation/landlord/LandlordPropertiesStack';
import type { LandlordTabParamList } from '../../../navigation/landlord/LandlordTabNavigator';
import { colors } from '../../../theme/colors';

type Props = NativeStackScreenProps<LandlordPropertiesStackParamList, 'AddEditProperty'>;

// The one screen in this pillar that actually gates on something real:
// publishing is blocked until landlord verification is at least
// submitted/pending (there's no automated LRS lookup for MVP — see
// LandlordVerificationProvider — so "verified" only ever happens manually).
// Saving as a draft is never gated, since it isn't visible to renters.
export function AddEditPropertyScreen({ navigation, route }: Props) {
  const isEditing = Boolean(route.params.propertyId);
  const { status } = useLandlordVerification();
  const parentNav = navigation.getParent<BottomTabNavigationProp<LandlordTabParamList>>();
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');

  const canPublish = status === 'verified';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{isEditing ? 'Edit property' : 'Add a property'}</Text>

      <FormInput label="Address" onChangeText={setAddress} placeholder="Street, city, postcode" value={address} />
      <View style={styles.spacer} />
      <FormInput
        keyboardType="number-pad"
        label="Monthly rent"
        onChangeText={setRent}
        placeholder="£0"
        value={rent}
      />

      {!canPublish ? (
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={20} />
            <Text style={styles.noticeTitle}>Verification required to publish</Text>
          </View>
          <Text style={styles.noticeBody}>
            {status === 'pending'
              ? 'Your landlord verification is pending review. You can save a draft now and publish once it clears.'
              : 'Verify your identity and landlord registration before this listing can go live. You can still save it as a draft.'}
          </Text>
          {status === 'unverified' ? (
            <Pressable
              onPress={() => parentNav?.navigate('LandlordProfileTab')}
              style={styles.noticeLink}
            >
              <Text style={styles.noticeLinkText}>Go to verification</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={[styles.button, styles.draftButton]}>
          <Text style={styles.draftButtonText}>Save draft</Text>
        </Pressable>
        <Pressable
          disabled={!canPublish}
          style={[styles.button, styles.publishButton, !canPublish && styles.publishButtonDisabled]}
        >
          <Text style={styles.publishButtonText}>Publish</Text>
        </Pressable>
      </View>
      <Text style={styles.footnote}>
        Properties aren't connected to an API yet — nothing here is saved beyond this screen.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 20 },
  spacer: { height: 16 },
  noticeCard: { backgroundColor: colors.background, borderColor: colors.danger, marginTop: 20 },
  noticeHeader: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  noticeTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  noticeBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8 },
  noticeLink: { marginTop: 10 },
  noticeLinkText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 28 },
  button: { alignItems: 'center', borderRadius: 28, flex: 1, justifyContent: 'center', minHeight: 56 },
  draftButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1 },
  draftButtonText: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  publishButton: { backgroundColor: colors.accent },
  publishButtonDisabled: { backgroundColor: colors.accentMuted },
  publishButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 12, marginTop: 14, textAlign: 'center' },
});
