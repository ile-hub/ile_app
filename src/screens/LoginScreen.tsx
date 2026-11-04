import { colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthProvider';
import { FormInput } from '../components/FormInput';
import { signIn } from '../lib/auth';
import { isValidEmail } from '../lib/validation';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { sessionError } = useAuth();
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
    const { error: signInError } = await signIn(email, password);

    // On success AuthProvider loads GET /me and swaps this screen out for
    // the role's tabs; if that fails it comes back here with sessionError.
    if (signInError) {
      setError(signInError.message);
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
            <Image source={require('../../assets/leri-logo.png')} style={styles.brandLogo}
              resizeMode="contain" accessibilityLabel="Lérí" accessibilityRole="image" />
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Better renting connections start here.</Text>
            <Text style={styles.subtitle}>
              Discover people who fit what you’re looking for... without the guesswork.
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

            {error ?? sessionError ? (
              <Text style={styles.error}>{error ?? sessionError}</Text>
            ) : null}

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

          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>New to Lérí? </Text>
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
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24, paddingHorizontal: 32 },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 22,
  },
  brandLogo: { width: 88, height: 88 },
  intro: { marginTop: 24 },
  title: { color: colors.textPrimary, fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 12 },
  form: { gap: 16, marginTop: 38 },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  loginButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 56,
  },
  loginButtonPressed: { backgroundColor: colors.accentPressed },
  loginButtonDisabled: { backgroundColor: colors.accentMuted },
  loginButtonText: { color: colors.onAccent, fontSize: 16, fontWeight: '700' },
  textAction: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 34,
  },
  signupPrompt: { color: colors.textMuted, fontSize: 14 },
  signupLink: { color: colors.accent, fontSize: 14, fontWeight: '800' },
});
