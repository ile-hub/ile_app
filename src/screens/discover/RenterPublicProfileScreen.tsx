import { useAuth } from '../../auth/AuthProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge, ProfileVerification } from '../../components/StatusBadge';
import { profileSummary } from '../../lib/profiles';
import { api, ApiError } from '../../lib/api';
import { TRUST_PILLARS } from '../../lib/trustPillars';
import { useApiQuery } from '../../lib/useApiQuery';
import type { PublicRenterProfile } from '../../lib/phase1Types';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

export function RenterPublicProfileContent({ profile, label, onRequest }: {
  profile?: PublicRenterProfile; label?: string; onRequest?: () => void;
}) {
  const budget = profile && (profile.budgetMin !== null || profile.budgetMax !== null)
    ? `£${profile.budgetMin ?? '—'} – £${profile.budgetMax ?? '—'} per month` : 'Not provided';
  return <View style={styles.content}>
    {label || !profile ? <StatusBadge label={label ?? 'Layout only · no renter loaded'} tone="highlight" /> : null}
    <Text style={styles.title}>{profileSummary(profile?.displayName) || 'Renter profile'}</Text>
    {profile?.photoUrl ? <Image source={{ uri: profile.photoUrl }} accessibilityLabel="Public renter portrait" style={{ width: 80, height: 80, borderRadius: 40 }} /> : null}
    {profile ? <ProfileVerification verification={profile.verification} /> : <StatusBadge label="Verification unavailable" />}
    <Card><Text style={styles.heading}>About</Text><Text style={styles.body}>{profileSummary(profile?.bio) || 'Not provided.'}</Text></Card>
    <Card><Text style={styles.heading}>Beyond the paperwork, why would you make a great tenant?</Text><Text style={styles.body}>{profileSummary(profile?.personalStory) || 'Not provided (optional).'}</Text></Card>
    <Card><View style={styles.content}><Text style={styles.heading}>Tenancy preferences</Text>
      <Text style={styles.body}>Preferred area: {profile?.preferredLocation || 'Not provided'}</Text>
      <Text style={styles.body}>Budget: {budget}</Text>
      <Text style={styles.body}>Move date: {profile?.targetMoveDate || 'Not provided'}</Text>
      <Text style={styles.body}>Duration: {profile?.tenancyLengthMonths ? `${profile.tenancyLengthMonths} months` : 'Not provided'}</Text>
      <Text style={styles.body}>Household size: {profile?.householdSize ?? 'Not provided'}</Text>
      <Text style={styles.body}>Household type: {profile?.householdType ?? 'Not provided'}</Text>
      <Text style={styles.body}>Preferences: {profile?.householdPreferences.map((value) => ({ pet_friendly: 'Pet friendly', smoke_free: 'Smoke free', sharing: 'Sharing' })[value]).join(', ') || 'None stated'}</Text>
    </View></Card>
    <Text style={styles.heading}>ARCS evidence summary</Text>
    {profile?.evidenceSummary?.map(strand => <Card key={strand.pillar}><View style={styles.content}>
      <Text style={styles.heading}>{TRUST_PILLARS.find(item => item.id === strand.pillar)?.label}</Text>
      <StatusBadge label={strand.status} />
      {strand.categories.map((category, index) => <Text key={`${index}:${category.catalogueId}`} style={styles.body}>{category.label} · {category.status}</Text>)}
    </View></Card>)}
    <Text style={styles.note}>Only evidence categories and their status are shared. Private documents and explanations stay private.</Text>
    {label ? null : <>
      <Button disabled={!onRequest} label="Request to Connect" onPress={onRequest} />
      <Text style={styles.note}>Introduce yourself before you connect. A connection is not a tenancy agreement.</Text>
    </>}
  </View>;
}
export function RenterPublicProfileScreen({ navigation, route }: NativeStackScreenProps<DiscoverStackParamList, 'RenterPublicProfile'>) {
  const { user, role } = useAuth();
  const id = route.params?.renterId;
  const query = useApiQuery(`public-renter/${id ?? 'layout'}`, () => id ? api.getPublicProfile(id) : Promise.resolve(null));
  if (id && query.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (id && (query.error instanceof ApiError && [403, 404].includes(query.error.status) || !query.data || query.data.kind !== 'renter')) return <ScreenContainer>{query.error instanceof ApiError && query.error.status === 404 || query.data
    ? <ContentStateView state={{ kind: 'empty', message: 'This public renter profile is unavailable.' }} />
    : <ErrorState error={query.error ?? new Error('Unable to load profile.')} onRetry={query.reload} />}</ScreenContainer>;
  return <ScreenContainer refreshing={query.isRefreshing} onRefresh={() => void query.refresh()}>
    {query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : null}
    <RenterPublicProfileContent profile={query.data?.kind === 'renter' ? query.data : undefined}
    onRequest={id && query.data && query.data.kind !== role && id !== user?.id && !query.error ? () => navigation.navigate('RequestConnect', { recipientId: id! }) : undefined} /></ScreenContainer>;
}
