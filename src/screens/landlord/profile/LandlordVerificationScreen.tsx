import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLandlordVerification } from '../../../auth/LandlordVerificationProvider';
import { Card } from '../../../components/Card';
import { FormInput } from '../../../components/FormInput';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { colors } from '../../../theme/colors';

const STATUS_COPY = {
  unverified: { label: 'Not verified', icon: 'alert-circle-outline', color: colors.danger },
  pending: { label: 'Pending review', icon: 'time-outline', color: colors.accent },
  verified: { label: 'Verified', icon: 'checkmark-circle-outline', color: colors.accent },
} as const;

// Identity status + landlord registration number entry. Per the earlier
// decision there's no automated LRS lookup for MVP: submitting a number
// just moves this to "pending" for manual review (see
// LandlordVerificationProvider) rather than verifying automatically.
export function LandlordVerificationScreen() {
  const { registrationNumber, status, submitRegistrationNumber } = useLandlordVerification();
  const [draftNumber, setDraftNumber] = useState('');
  const copy = STATUS_COPY[status];
  const canSubmit = status === 'unverified' && draftNumber.trim().length > 0;

  return (
    <ScreenContainer>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons color={copy.color} name={copy.icon} size={22} />
          <Text style={styles.statusText}>{copy.label}</Text>
        </View>
        {registrationNumber ? (
          <Text style={styles.statusSubtext}>Registration number: {registrationNumber}</Text>
        ) : null}
      </Card>

      {status === 'unverified' ? (
        <>
          <FormInput
            autoCapitalize="characters"
            label="Landlord registration number"
            onChangeText={setDraftNumber}
            placeholder="e.g. LRS-000000"
            value={draftNumber}
          />
          <Pressable
            disabled={!canSubmit}
            onPress={() => submitRegistrationNumber(draftNumber.trim())}
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>Submit for review</Text>
          </Pressable>
          <Text style={styles.footnote}>
            Reviewed manually for now — there's no automated registry lookup yet.
          </Text>
        </>
      ) : status === 'pending' ? (
        <Text style={styles.footnote}>
          Your registration number is under manual review. This can take a few days.
        </Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusCard: { marginBottom: 24 },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  statusText: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  statusSubtext: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 56,
  },
  submitButtonDisabled: { backgroundColor: colors.accentMuted },
  submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
  footnote: { color: colors.textMuted, fontSize: 12, marginTop: 10, textAlign: 'center' },
});
