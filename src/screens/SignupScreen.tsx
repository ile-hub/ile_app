import { LegalPreferences } from '../components/LegalPreferences';
import { colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '../components/FormInput';
import { signUp, type SelfServeRole } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { isValidEmail } from '../lib/validation';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<SelfServeRole>('renter');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const signupDisabled = isSubmitting || !email || !password || !displayName.trim() || !termsAccepted;

  function validateEmail(value: string) {
    const nextError = isValidEmail(value) ? null : 'Enter a valid email address.';
    setEmailError(nextError);
    return !nextError;
  }

  async function handleSignup() {
    const isEmailValid = validateEmail(email);
    const nextPasswordError =
      password.length >= 6 ? null : 'Password must be at least 6 characters.';
    setPasswordError(nextPasswordError);
    setError(null);

    if (!isEmailValid || nextPasswordError || !displayName.trim() || !termsAccepted) return;

    setIsSubmitting(true);
    const { error: signUpError } = await signUp({ email, password, displayName, role });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Image source={require('../../assets/leri-logo.png')} style={styles.brandLogo}
              resizeMode="contain" accessibilityLabel="Lérí" accessibilityRole="image" />
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Renting works better when trust goes both ways.</Text>
            <Text style={styles.subtitle}>
              Tell us who you are, what matters to you and what you’re looking for. We’ll help you discover compatible people.
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              autoCapitalize="words"
              autoComplete="name"
              label="Display name"
              onChangeText={setDisplayName}
              placeholder="Name"
              returnKeyType="next"
              value={displayName}
            />
            <FormInput
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
              keyboardType="email-address"
              label="Email"
              onBlur={() => validateEmail(email)}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) validateEmail(value);
              }}
              placeholder="you@example.com"
              returnKeyType="next"
              value={email}
            />
            <FormInput
              autoCapitalize="none"
              autoComplete="new-password"
              error={passwordError}
              label="Password"
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError && value.length >= 6) setPasswordError(null);
              }}
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
            />

            <View style={styles.roleField}>
              <Text style={styles.roleLabel}>I’m joining as</Text>
              <View style={styles.roleSelector}>
                {(['renter', 'landlord'] as const).map((option) => {
                  const isSelected = role === option;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      key={option}
                      onPress={() => setRole(option)}
                      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                    >
                      <Text style={[styles.roleText, isSelected && styles.roleTextSelected]}>
                        {option === 'renter' ? 'I’m renting' : 'I’m a landlord'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.termsField}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="I agree to the Terms and Conditions"
                accessibilityState={{ checked: termsAccepted, disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={() => setTermsAccepted((accepted) => !accepted)}
                style={styles.termsRow}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.termsText}>I agree to the Terms and Conditions.</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setShowLegal(true)} style={styles.termsLink}>
                <Text style={styles.termsLinkText}>Read terms and privacy notice</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.submitError}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={signupDisabled}
              accessibilityState={{ disabled: signupDisabled, busy: isSubmitting }}
              onPress={handleSignup}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                signupDisabled &&
                  styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? 'Creating your profile…' : 'Join Lérí'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>I already have a profile</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={showLegal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLegal(false)}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable accessibilityRole="button" onPress={() => setShowLegal(false)} style={styles.closeLegal}>
            <Text style={styles.termsLinkText}>Done</Text>
          </Pressable>
          <ScrollView contentContainerStyle={styles.legalContent}>
            <LegalPreferences />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 24 },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 18,
    paddingTop: 10,
  },
  brandLogo: { width: 88, height: 88 },
  intro: { paddingBottom: 22, paddingTop: 18 },
  
  title: {
    color: colors.textPrimary,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 35,
  },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 21, marginTop: 10 },
  form: { gap: 14 },
  roleField: { gap: 7 },
  roleLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  roleSelector: {
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 4,
  },
  roleOption: { alignItems: 'center', borderRadius: 13, flex: 1, paddingVertical: 11 },
  roleOptionSelected: { backgroundColor: colors.surface },
  roleText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  roleTextSelected: { color: colors.accent },
  termsField: { gap: 2 },
  termsRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 44 },
  checkbox: { alignItems: 'center', justifyContent: 'center', width: 24, height: 24,
    borderWidth: 2, borderColor: colors.accent, borderRadius: 5, backgroundColor: colors.surface },
  checkboxChecked: { backgroundColor: colors.accent },
  checkmark: { color: colors.onAccent, fontSize: 17, fontWeight: '700' },
  termsText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, flex: 1 },
  termsLink: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44, paddingLeft: 36 },
  termsLinkText: { color: colors.accent, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  closeLegal: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 16 },
  legalContent: { paddingHorizontal: 24, paddingBottom: 28 },
  submitError: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 2,
    minHeight: 56,
    paddingHorizontal: 20,
  },
  submitButtonPressed: { backgroundColor: colors.accentPressed },
  submitButtonDisabled: { opacity: 0.45 },
  submitText: { color: colors.onAccent, fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingTop: 18 },
  loginText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
