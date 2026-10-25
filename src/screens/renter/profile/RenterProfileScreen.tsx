import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../auth/AuthProvider';
import { useProfile } from '../../../auth/ProfileProvider';
import { ProfileEditor } from '../../../components/ProfileEditor';
import { LegalPreferences } from '../../../components/LegalPreferences';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ScreenContainer, screenStyles } from '../../../components/ScreenContainer';
import { profileSummary } from '../../../lib/profiles';
import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import { colors } from '../../../theme/colors';
import type { RenterProfileStackParamList } from '../../../navigation/renter/RenterProfileStack';

type Props = NativeStackScreenProps<RenterProfileStackParamList, 'RenterProfileMain'>;

export function RenterProfileScreen({ navigation }: Props) {
  const { profile } = useProfile();
  return <AccountProfileScreen focused dashboard roleLabel="Renter" menuItems={[
    { key: 'about', label: 'About me', detail: profileSummary(profile?.bio) || 'Personal details, introduction and your story', icon: 'person-outline', onPress: () => navigation.navigate('AboutMe') },
    { key: 'housing', label: 'My housing preferences', detail: profile?.kind === 'renter' && profile.preferredLocation || 'Location, budget, move timing and household', icon: 'home-outline', onPress: () => navigation.navigate('HousingPreferences') },
    { key: 'arcs', label: 'My ARCS evidence', detail: 'Affordability, Reliability, Community and Stability', icon: 'folder-outline', onPress: () => navigation.navigate('Evidence') },
    { key: 'verification', label: 'Identity verification', detail: profile ? `${profile.verification.mode === 'demo' ? 'Demo · ' : ''}Identity: ${profile.verification.identityStatus}` : 'View your current verification status', icon: 'shield-checkmark-outline', onPress: () => navigation.navigate('VerificationStatus') },
    { key: 'preview', label: 'Preview my public profile', detail: 'See your saved profile as others see it', icon: 'eye-outline', onPress: () => navigation.navigate('PublicProfilePreview') },
  ]} />;
}
export function RenterProfileEditorScreen({ route }: NativeStackScreenProps<RenterProfileStackParamList, 'AboutMe' | 'HousingPreferences' | 'PersonalStory' | 'PublicProfilePreview'>) {
  const section = { AboutMe: 'about', HousingPreferences: 'housing', PersonalStory: 'story', PublicProfilePreview: 'preview' } as const;
  return <ScreenContainer><ProfileEditor role="renter" routed initialSection={section[route.name]} /></ScreenContainer>;
}
export function RenterSettingsScreen() {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true); setError(null);
    try { await signOut(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to log out.'); }
    finally { setBusy(false); }
  }
  return <ScreenContainer><View style={screenStyles.content}>
    <Card><Text style={styles.rowTitle}>Your account</Text><Text selectable style={styles.detail}>{user?.email}</Text></Card>
    <LegalPreferences />
    {error ? <Text accessibilityRole="alert" style={screenStyles.body}>{error}</Text> : null}
    <Button label="Log out" variant="secondary" loading={busy} disabled={busy} onPress={() => void logout()} />
  </View></ScreenContainer>;
}
const styles = StyleSheet.create({
  rowTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
