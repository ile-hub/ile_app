import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
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

    if (!isEmailValid || nextPasswordError || !displayName.trim()) return;

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
            <View style={styles.brandMark} />
            <Text style={styles.brandName}>Ilé</Text>
          </View>

          {/* <View style={styles.hero} accessibilityElementsHidden>
            <View style={styles.heroBuildingLeft} />
            <View style={styles.heroBuildingRight} />
            <View style={styles.heroLine} />
          </View> */}

          <View style={styles.intro}>
            <Text style={styles.title}>Renting works better when people vouch for people.</Text>
            <Text style={styles.subtitle}>
              Join 12,400+ renters building a profile that speaks for them.
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              autoCapitalize="words"
              autoComplete="name"
              label="Display name"
              onChangeText={setDisplayName}
              placeholder="How should we address you?"
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
                        {option === 'renter' ? 'Renter' : 'Landlord'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.submitError}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting || !email || !password || !displayName.trim()}
              onPress={handleSignup}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                (isSubmitting || !email || !password || !displayName.trim()) &&
                  styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? 'Creating your profile…' : 'Join Ilé'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>I already have a profile</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F2EB', flex: 1 },
  content: { paddingBottom: 28, paddingHorizontal: 24 },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 18,
    paddingTop: 10,
  },
  brandMark: {
    backgroundColor: '#C84A24',
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  brandName: { color: '#1D1815', fontSize: 24, fontWeight: '800' },
  hero: {
    backgroundColor: '#E8DFD4',
    borderRadius: 3,
    height: 118,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBuildingLeft: {
    backgroundColor: '#D7C9BC',
    bottom: -18,
    height: 112,
    left: 22,
    position: 'absolute',
    transform: [{ rotate: '-8deg' }],
    width: '48%',
  },
  heroBuildingRight: {
    backgroundColor: '#DED2C6',
    bottom: -28,
    height: 130,
    position: 'absolute',
    right: 22,
    transform: [{ rotate: '9deg' }],
    width: '44%',
  },
  heroLine: {
    backgroundColor: '#B9A99B',
    bottom: 28,
    height: 1,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  intro: { paddingBottom: 22, paddingTop: 18 },
  
  title: {
    color: '#1D1815',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 35,
  },
  subtitle: { color: '#675D56', fontSize: 15, lineHeight: 21, marginTop: 10 },
  form: { gap: 14 },
  roleField: { gap: 7 },
  roleLabel: { color: '#312823', fontSize: 13, fontWeight: '600' },
  roleSelector: {
    backgroundColor: '#E8DFD6',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 4,
  },
  roleOption: { alignItems: 'center', borderRadius: 13, flex: 1, paddingVertical: 11 },
  roleOptionSelected: { backgroundColor: '#FFFCF8' },
  roleText: { color: '#6F625A', fontSize: 15, fontWeight: '600' },
  roleTextSelected: { color: '#9D361A' },
  submitError: { color: '#A73B2B', fontSize: 13, textAlign: 'center' },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#A93B1E',
    borderRadius: 28,
    justifyContent: 'center',
    marginTop: 2,
    minHeight: 56,
    paddingHorizontal: 20,
  },
  submitButtonPressed: { backgroundColor: '#8D2F18' },
  submitButtonDisabled: { opacity: 0.45 },
  submitText: { color: '#FFF9F3', fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingTop: 18 },
  loginText: { color: '#2D2521', fontSize: 14, fontWeight: '600' },
});
