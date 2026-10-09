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
import { getSelfServeRole, signIn } from '../lib/auth';
import { isValidEmail } from '../lib/validation';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail(value: string) {
    const nextError = isValidEmail(value) ? null : 'Enter a valid email address.';
    setEmailError(nextError);
    return !nextError;
  }

  async function handleLogin() {
    if (!validateEmail(email)) return;

    setError(null);
    setIsSubmitting(true);
    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    const user = data.session?.user ?? data.user;
    const role = user ? getSelfServeRole(user) : null;

    if (!role) {
      setError('Your account does not have a valid renter or landlord role.');
      setIsSubmitting(false);
    }
  }

  function showUnavailable(feature: string) {
    setError(`${feature} is not available yet.`);
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
            <Text style={styles.brandName}>Leri</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Your file is where you left it. Nothing was shared while you were away.
            </Text>
          </View>

          <View style={styles.form}>
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
              autoComplete="current-password"
              label="Password"
              onChangeText={setPassword}
              onRightActionPress={() => setShowPassword((current) => !current)}
              placeholder="Your password"
              rightActionLabel={showPassword ? 'Hide' : 'Show'}
              secureTextEntry={!showPassword}
              value={password}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting || !email || !password}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                (isSubmitting || !email || !password) && styles.loginButtonDisabled,
              ]}
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </Text>
            </Pressable>

            <Pressable onPress={() => showUnavailable('Password recovery')}>
              <Text style={styles.textAction}>Forgot your password?</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={() => showUnavailable('One-time code login')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Email me a one-time code</Text>
            </Pressable>
            <Pressable
              onPress={() => showUnavailable('Passkey login')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Use passkey</Text>
            </Pressable>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>New to Leri? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create a profile</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F9F0E8', flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24, paddingHorizontal: 32 },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 22,
  },
  brandMark: { backgroundColor: '#D65A32', borderRadius: 16, height: 32, width: 32 },
  brandName: { color: '#241D19', fontSize: 20, fontWeight: '800' },
  intro: { marginTop: 62 },
  title: { color: '#211B18', fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: '#6B5F58', fontSize: 15, lineHeight: 23, marginTop: 12 },
  form: { gap: 16, marginTop: 38 },
  error: { color: '#A73B2B', fontSize: 13, textAlign: 'center' },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#A93B1E',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 56,
  },
  loginButtonPressed: { backgroundColor: '#8D2F18' },
  loginButtonDisabled: { backgroundColor: '#E9C9BC' },
  loginButtonText: { color: '#FFF9F3', fontSize: 16, fontWeight: '700' },
  textAction: {
    color: '#4B403A',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  divider: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  dividerLine: { backgroundColor: '#DED0C5', flex: 1, height: 1 },
  dividerText: { color: '#786B63', fontSize: 12, fontWeight: '700' },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#FFFCF8',
    borderColor: '#D9CCC2',
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: { color: '#302722', fontSize: 15, fontWeight: '700' },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 34,
  },
  signupPrompt: { color: '#74675F', fontSize: 14 },
  signupLink: { color: '#A93B1E', fontSize: 14, fontWeight: '800' },
});
