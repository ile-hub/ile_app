import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileEditor } from '../../../components/ProfileEditor';
import { AccountProfileScreen } from '../../../components/AccountProfileScreen';
import { ArcsPreferences } from '../../../components/ArcsPreferences';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { useProfile } from '../../../auth/ProfileProvider';
import type { LandlordProfileStackParamList } from '../../../navigation/landlord/LandlordProfileStack';

type Props = NativeStackScreenProps<LandlordProfileStackParamList, 'LandlordProfileMain'>;
export function LandlordProfileScreen({ navigation }: Props) {
  const { profile } = useProfile();
  return <AccountProfileScreen focused dashboard roleLabel="Landlord" menuItems={[
    { key: 'about', label: 'About me', detail: 'Your introduction, approach and personal story', icon: 'person-outline', onPress: () => navigation.navigate('LandlordAbout') },
    { key: 'business', label: 'Business & registration', detail: 'Your business, experience and private registration details', icon: 'business-outline', onPress: () => navigation.navigate('LandlordBusiness') },
    { key: 'arcs', label: 'My ARCS preferences', detail: 'Explore priorities and evidence choices · unsaved', icon: 'options-outline', onPress: () => navigation.navigate('LandlordArcs') },
    { key: 'verification', label: 'Verification status', detail: profile ? `${profile.verification.mode === 'demo' ? 'Demo · ' : ''}Identity: ${profile.verification.identityStatus}` : 'View current verification results', icon: 'shield-checkmark-outline', onPress: () => navigation.navigate('LandlordVerification') },
    { key: 'preview', label: 'Preview my public profile', detail: 'See your saved profile as others see it', icon: 'eye-outline', onPress: () => navigation.navigate('LandlordPreview') },
  ]} />;
}
export function LandlordProfileEditorScreen({ route }: NativeStackScreenProps<LandlordProfileStackParamList, 'LandlordAbout' | 'LandlordBusiness' | 'LandlordPreview'>) {
  const sections = { LandlordAbout: 'about', LandlordBusiness: 'business', LandlordPreview: 'preview' } as const;
  return <ScreenContainer><ProfileEditor role="landlord" routed initialSection={sections[route.name]} /></ScreenContainer>;
}
export function LandlordArcsScreen() {
  return <ScreenContainer><ArcsPreferences scope="default" /></ScreenContainer>;
}
export function LandlordSettingsScreen() {
  return <AccountProfileScreen focused settingsOnly roleLabel="Landlord" />;
}
