import { useEffect, useState } from 'react';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { Alert, Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../auth/ProfileProvider';
import { api } from '../lib/api';
import type { SelfServeRole } from '../lib/auth';
import type { OwnProfile, PublicProfile, HouseholdType, HouseholdPreference } from '../lib/phase1Types';
import { profileDraft, profileFields, profilePatch, profileSummary } from '../lib/profiles';
import { Card } from './Card';
import { ArcsPreferences } from './ArcsPreferences';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { ErrorState, LoadingState } from './QueryState';
import { screenStyles as styles } from './ScreenContainer';
import { SelectionOption } from './SelectionOption';
import { StatusBadge, ProfileVerification } from './StatusBadge';
import { RenterPublicProfileContent } from '../screens/discover/RenterPublicProfileScreen';
import { LandlordPublicProfileContent } from '../screens/discover/LandlordProfileScreen';

export type ProfileSection = 'overview' | 'about' | 'housing' | 'story' | 'preview' | 'business';
export function ProfileEditor({ role, onSectionChange, initialSection, routed = false }: { role: SelfServeRole; onSectionChange?: (section: string) => void; initialSection?: ProfileSection; routed?: boolean }) {
  const { profile, isLoading, error, reload } = useProfile();
  if (!profile) return isLoading ? <LoadingState /> : <ErrorState error={error ?? new Error('Your profile is unavailable.')} onRetry={reload} />;
  if (profile.kind !== role) return <Text style={styles.body}>This account profile does not match the active role.</Text>;
  return <ProfileForm profile={profile} onSectionChange={onSectionChange} initialSection={initialSection} routed={routed} />;
}
function ProfileForm({ profile, onSectionChange, initialSection, routed }: { profile: OwnProfile; onSectionChange?: (section: string) => void; initialSection?: ProfileSection; routed: boolean }) {
  const { save, reload, error: loadError } = useProfile();
  const [section, setSection] = useState<ProfileSection>(initialSection ?? (profile.kind === 'renter' ? 'overview' : 'about'));
  function navigateSection(next: typeof section) { if (section === 'overview') hydrate(profile); setSection(next); onSectionChange?.(next); }
  const [base, setBase] = useState(profile);
  const [draft, setDraft] = useState(() => profileDraft(profile));
  const [discoverable, setDiscoverable] = useState(profile.discoverable);
  const [householdType, setHouseholdType] = useState<HouseholdType | null>(profile.kind === 'renter' ? profile.householdType : null);
  const [preferences, setPreferences] = useState<HouseholdPreference[]>(profile.kind === 'renter' ? profile.householdPreferences : []);
  const [landlordType, setLandlordType] = useState(profile.kind === 'landlord' ? profile.landlordType : null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<PublicProfile | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<Error | null>(null);
  function hydrate(value: OwnProfile) {
    setBase(value); setDraft(profileDraft(value)); setDiscoverable(value.discoverable);
    setHouseholdType(value.kind === 'renter' ? value.householdType : null);
    setPreferences(value.kind === 'renter' ? value.householdPreferences : []);
    setLandlordType(value.kind === 'landlord' ? value.landlordType : null);
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(profileDraft(base)) || discoverable !== base.discoverable ||
    (base.kind === 'renter' ? householdType !== base.householdType || JSON.stringify(preferences) !== JSON.stringify(base.householdPreferences) : landlordType !== base.landlordType);
  const navigation = useNavigation();
  usePreventRemove(routed && (dirty || busy), ({ data }) => {
    if (busy) { Alert.alert('Saving profile', 'Please wait for your changes to finish saving.'); return; }
    Alert.alert('Discard unsaved changes?', 'Your saved profile will stay unchanged.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard changes', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });
  useEffect(() => { if (initialSection === 'preview') void loadPreview(); }, [initialSection]);
  async function reloadForm() {
    if (dirty || busy) return;
    setBusy(true);
    try {
      const saved = await reload();
      if (saved) { hydrate(saved); setSuccess(null); setPreview(null); }
    } finally { setBusy(false); }
  }
  async function handleSave() {
    setBusy(true); setError(null); setSuccess(null);
    try {
      const body = profilePatch(base, draft);
      if (discoverable !== base.discoverable) body.discoverable = discoverable;
      if (base.kind === 'renter') {
        if (householdType !== base.householdType) body.householdType = householdType;
        if (JSON.stringify(preferences) !== JSON.stringify(base.householdPreferences)) body.householdPreferences = preferences;
      } else {
        if (landlordType !== base.landlordType) body.landlordType = landlordType;
      }
      if (!Object.keys(body).length) { setError('No profile changes to save.'); return; }
      const saved = await save(body);
      hydrate(saved); setPreview(null); setSuccess('Profile saved to your account.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save profile. Your edits have been kept.'); }
    finally { setBusy(false); }
  }
  async function loadPreview() {
    setPreviewLoading(true); setPreviewError(null); setPreview(null);
    try { setPreview(await api.getProfilePreview()); }
    catch (err) { setPreviewError(err instanceof Error ? err : new Error('Unable to load saved preview.')); }
    finally { setPreviewLoading(false); }
  }
  async function chooseLocalPhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]) setLocalPhoto(result.assets[0].uri);
    } catch { setError('Unable to choose a local photo.'); }
  }
  const renter = base.kind === 'renter';
  const aboutKeys = ['displayName', 'bio', 'photoUrl', 'currentLocation'];
  const landlordAboutKeys = ['displayName', 'bio', 'photoUrl', 'communicationStyle', 'lettingApproach', 'tenantExpectations', 'tenancySuccess'];
  const visibleFields = profileFields(base.kind).filter((field) => !renter ? !routed || (section === 'about' ? landlordAboutKeys.includes(field.key) : !landlordAboutKeys.includes(field.key)) : (section === 'about' ? aboutKeys.includes(field.key) || (routed && field.key === 'personalStory')
    : section === 'story' ? field.key === 'personalStory' : !aboutKeys.includes(field.key) && field.key !== 'personalStory'));
  if (renter && section === 'overview') return <View style={styles.content}>
    <Text style={styles.body}>{profileSummary(profile.bio) || 'Tell people a little about yourself and the home you’re looking for.'}</Text>
    <Button label="Edit Profile" onPress={() => navigateSection('about')} />
    <Card><View style={styles.content}><Text style={styles.heading}>About Me</Text>
      <Text style={styles.body}>{profile.kind === 'renter' && profileSummary(profile.personalStory) || 'Your story goes beyond the paperwork.'}</Text>
      <Button label="Personal Details / About Me" variant="secondary" onPress={() => navigateSection('about')} />
      <Button label="Personal Story" variant="secondary" onPress={() => navigateSection('story')} />
    </View></Card>
    <Card><View style={styles.content}><Text style={styles.heading}>Housing Preferences</Text>
      <Text style={styles.body}>{profile.kind === 'renter' ? profile.preferredLocation || 'Where would you like to live?' : ''}</Text>
      <Button label="Edit Housing Preferences" variant="secondary" onPress={() => navigateSection('housing')} />
    </View></Card>
    <Button label="Preview Public Profile" variant="secondary" onPress={() => { navigateSection('preview'); void loadPreview(); }} />
    {loadError ? <ErrorState error={loadError} onRetry={reload} /> : null}
  </View>;
  if (section === 'preview') return <View style={styles.content}>
    {!routed ? <Button label="Back to profile" variant="secondary" onPress={() => navigateSection('overview')} /> : null}
    <Text style={styles.note}>This is your saved public profile. Private evidence and unsaved edits are excluded.</Text>
    {previewLoading ? <LoadingState /> : previewError ? <ErrorState error={previewError} onRetry={() => void loadPreview()} />
      : preview?.kind === 'renter' ? <RenterPublicProfileContent profile={preview} label="Saved public preview" />
      : preview?.kind === 'landlord' ? <LandlordPublicProfileContent profile={preview} label="Saved public preview" /> : null}
  </View>;
  return <View style={styles.content}>
    {renter && !routed ? <>
      <Button label="Back to profile" variant="secondary" disabled={dirty || busy} onPress={() => navigateSection('overview')} />
      <Text style={styles.heading}>{section === 'about' ? 'Personal Details / About Me' : section === 'housing' ? 'Housing Preferences' : 'Personal Story'}</Text>
      {dirty ? <Text style={styles.note}>Save your changes or discard them before returning.</Text> : null}
      {dirty ? <Button label="Discard changes" variant="secondary" disabled={busy} onPress={() => { hydrate(profile); setError(null); setSuccess(null); }} /> : null}
    </> : !renter && !routed ? <Text style={styles.heading}>Edit your profile</Text> : dirty ? <>
      <Text style={styles.note}>You have unsaved changes.</Text>
      <Button label="Discard changes" variant="secondary" disabled={busy} onPress={() => { hydrate(profile); setError(null); setSuccess(null); }} />
    </> : null}
    <StatusBadge label={dirty ? 'Unsaved changes' : 'Saved account profile'} tone={dirty ? 'highlight' : 'neutral'} />
    {!renter && !routed ? <ProfileVerification verification={profile.verification} /> : null}
    {loadError ? <ErrorState error={loadError} onRetry={reload} /> : null}
    <Text style={styles.note}>Your profile photo, bio and personal prompts are public. Never include identity scans, financial documents or private storage links.</Text>
    {visibleFields.map((field) => <FormInput key={field.key} label={field.label} value={draft[field.key] ?? ''}
      editable={!busy} multiline={field.multiline} maxLength={field.maxLength}
      autoCapitalize={field.key === 'photoUrl' ? 'none' : 'sentences'}
      keyboardType={field.numeric ? 'decimal-pad' : field.key === 'photoUrl' ? 'url' : 'default'}
      onChangeText={(value) => { setDraft((current) => ({ ...current, [field.key]: value })); setSuccess(null); }} />)}
    {(!renter && !routed) || section === 'about' ? <><SelectionOption label="Make my profile discoverable to the other role" selected={discoverable} disabled={busy}
      onPress={() => { setDiscoverable((value) => !value); setSuccess(null); }} />
    <Text style={styles.note}>Choose whether other people can discover your profile.</Text></> : null}
    {renter ? section === 'housing' ? <>
      <Text style={styles.heading}>Household type (optional)</Text>
      <View style={styles.row}>{(['single', 'couple', 'family', 'sharers'] as const).map((value) => <Button key={value} label={value}
        disabled={busy} accessibilityState={{ selected: householdType === value }} variant={householdType === value ? 'primary' : 'secondary'}
        onPress={() => { setHouseholdType(householdType === value ? null : value); setSuccess(null); }} />)}</View>
      <Text style={styles.heading}>Household preferences</Text>
      {(['pet_friendly', 'smoke_free', 'sharing'] as const).map((value) => <SelectionOption key={value}
        label={{ pet_friendly: 'Pet friendly', smoke_free: 'Smoke free', sharing: 'Sharing' }[value]} selected={preferences.includes(value)} disabled={busy}
        onPress={() => { setPreferences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]); setSuccess(null); }} />)}
    </> : null : !routed || section === 'business' ? <>
      <Text style={styles.heading}>Landlord type (optional)</Text>
      <View style={styles.row}>{(['individual', 'company', 'agent'] as const).map((value) => <Button key={value} label={value}
        disabled={busy} accessibilityState={{ selected: landlordType === value }} variant={landlordType === value ? 'primary' : 'secondary'}
        onPress={() => { setLandlordType(landlordType === value ? null : value); setSuccess(null); }} />)}</View>
      <Text style={styles.note}>Registration numbers are stored as submitted. Only the server can report pending or successful checks.</Text>
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
    {success ? <Text accessibilityLiveRegion="polite" style={styles.body}>{success}</Text> : null}
    <Button label="Save profile" loading={busy} disabled={!dirty || busy || previewLoading} onPress={() => void handleSave()} />
    <Button label="Reload saved profile" variant="secondary" disabled={dirty || busy} onPress={() => void reloadForm()} />
    {!renter && !routed ? <>
    <Button label="Preview saved public profile" variant="secondary" loading={previewLoading} disabled={busy} onPress={() => void loadPreview()} />
    <Text style={styles.note}>The preview comes from your saved account. Unsaved edits are excluded, even while your profile is hidden.</Text>
    {previewError ? <ErrorState error={previewError} onRetry={() => void loadPreview()} /> : null}
    {preview ? preview.kind === 'renter' ? <RenterPublicProfileContent profile={preview} label="Saved public preview" />
      : <LandlordPublicProfileContent profile={preview} label="Saved public preview" /> : null}
    <Button label="Preview a photo on this device" variant="secondary" onPress={() => void chooseLocalPhoto()} />
    {localPhoto ? <><Image source={{ uri: localPhoto }} accessibilityLabel="Local photo draft, not uploaded" style={{ width: 80, height: 80, borderRadius: 40 }} />
      <Button label="Remove photo preview" variant="secondary" onPress={() => setLocalPhoto(null)} /></> : null}
    <Text style={styles.note}>Photo uploads are not available yet. This preview stays on your device. To save a portrait, use a public image link above.</Text>
    </> : section === 'about' ? <>
      <Button label="Preview a photo on this device" variant="secondary" onPress={() => void chooseLocalPhoto()} />
      {localPhoto ? <><Image source={{ uri: localPhoto }} accessibilityLabel="Local photo draft, not uploaded" style={{ width: 80, height: 80, borderRadius: 40 }} />
        <Button label="Remove photo preview" variant="secondary" onPress={() => setLocalPhoto(null)} /></> : null}
      <Text style={styles.note}>This preview stays on your device and is not uploaded. You can save a public image link above.</Text>
    </> : null}
    {base.kind === 'landlord' && !routed ? <ArcsPreferences scope="default" /> : null}
  </View>;
}
