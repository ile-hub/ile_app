import type { ReactNode } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge, ProfileVerification } from '../../components/StatusBadge';
import { ApiError, api } from '../../lib/api';
import { formatBedrooms, formatRent } from '../../lib/properties';
import type { PublicLandlordProfile } from '../../lib/phase1Types';
import { profileSummary } from '../../lib/profiles';
import { TRUST_PILLARS } from '../../lib/trustPillars';
import { useApiQuery } from '../../lib/useApiQuery';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

export function LandlordPublicProfileContent({ profile, label, properties, onRequest }: {
  profile?: PublicLandlordProfile; label?: string; properties?: ReactNode; onRequest?: () => void;
}) {
  // Render only the explicit public contract; private registration fields never enter these groups.
  const story = [
    ['communicationStyle', 'How I communicate'], ['lettingApproach', 'My letting approach'],
    ['tenantExpectations', 'What you can expect from me'], ['tenancySuccess', 'What makes a tenancy work'],
  ] as const;
  const storyItems = story.map(([key, title]) => ({ title, text: profileSummary(profile?.[key]) })).filter(item => item.text);
  const bio = profileSummary(profile?.bio);
  const company = profileSummary(profile?.companyName);
  const hasBusiness = company || profile?.landlordType || profile?.lettingExperienceYears != null || profile?.numberOfProperties != null || !!profile?.locationsCovered.length;
  return <View style={styles.content}>
    {label || !profile ? <StatusBadge label={label ?? 'Layout only · no profile loaded'} tone="highlight" /> : null}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {profile?.photoUrl ? <Image source={{ uri: profile.photoUrl }} accessibilityLabel="Public landlord portrait" style={{ width: 72, height: 72, borderRadius: 36 }} /> : null}
      <View style={{ flex: 1, gap: 6 }}><Text style={styles.title}>{profileSummary(profile?.displayName) || 'Landlord profile'}</Text><Text style={styles.note}>Landlord</Text></View>
    </View>
    {bio ? <Text style={styles.body}>{bio}</Text> : null}
    {storyItems.length ? <Card><View style={styles.content}>
      <Text style={styles.heading}>Getting to know me</Text>
      {storyItems.map(item => <View key={item.title} style={{ gap: 6 }}><Text style={styles.heading}>{item.title}</Text><Text style={styles.body}>{item.text}</Text></View>)}
    </View></Card> : null}
    {hasBusiness ? <Card><View style={styles.content}>
      <Text style={styles.heading}>My letting background</Text>
      {company ? <Text style={styles.body}>{company}</Text> : null}
      {profile?.landlordType ? <Text style={styles.body}>Landlord type: {profile.landlordType}</Text> : null}
      {profile?.lettingExperienceYears != null ? <Text style={styles.body}>Letting experience: {profile.lettingExperienceYears} years</Text> : null}
      {profile?.numberOfProperties != null ? <Text style={styles.body}>Self-declared portfolio: {profile.numberOfProperties} properties</Text> : null}
      {profile?.locationsCovered.length ? <Text style={styles.body}>Locations: {profile.locationsCovered.join(', ')}</Text> : null}
    </View></Card> : null}
    {profile ? <Card><View style={styles.content}><Text style={styles.heading}>Verification</Text><ProfileVerification verification={profile.verification} /></View></Card> : <StatusBadge label="Verification unavailable" />}
    {profile?.arcsPreferences ? <Card><View style={styles.content}><Text style={styles.heading}>ARCS preferences</Text>
      {profile.arcsPreferences.priorityOrder.map((pillar, index) => <Text key={pillar} style={styles.body}>{index + 1}. {TRUST_PILLARS.find(item => item.id === pillar)?.label}</Text>)}
      <Text style={styles.note}>These preferences provide context, not scores or eligibility requirements. They never restrict who appears in discovery.</Text>
    </View></Card> : null}
    <Text style={styles.heading}>Available properties</Text>
    <Text style={styles.note}>Explore their available homes below. Full addresses stay private.</Text>
    {properties ?? (profile?.properties.length ? profile.properties.map(property => <Card key={property.id}>
      <Text style={styles.heading}>{property.title || property.details.publicArea || property.city}</Text>
      <Text style={styles.body}>{property.city} · {formatBedrooms(property.bedrooms)} · {formatRent(property.rentAmount, property.currency)}</Text>
    </Card>) : <Text style={styles.note}>No available properties to show.</Text>)}
    {label ? null : <>
      <Button label="Request to Connect" variant="secondary" disabled={!onRequest} onPress={onRequest} />
      <Text style={styles.note}>Introduce yourself before you connect. A connection is not a tenancy agreement.</Text>
    </>}
  </View>;
}

type Props = NativeStackScreenProps<DiscoverStackParamList, 'LandlordProfile'>;
export function LandlordProfileScreen({ navigation, route }: Props) {
  const { user, role } = useAuth();
  const id = route.params.landlordId;
  const query = useApiQuery(`public-landlord/${id ?? 'layout'}`, () => id ? api.getPublicProfile(id) : Promise.resolve(null));
  const visible = query.data?.kind === 'landlord' && !(query.error instanceof ApiError && [403, 404].includes(query.error.status));
  // Never use the old landlord endpoint as a fallback around new profile visibility.
  const properties = useApiQuery(`landlord-properties/${id ?? 'layout'}/${visible}`, () => id && visible ? api.getPublicLandlordProperties(id) : Promise.resolve(null));
  if (id && query.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (id && (query.error instanceof ApiError && [403, 404].includes(query.error.status) || !query.data || query.data.kind !== 'landlord')) return <ScreenContainer>{query.error instanceof ApiError && query.error.status === 404 || query.data
    ? <ContentStateView state={{ kind: 'empty', message: 'This public landlord profile is unavailable.' }} />
    : <ErrorState error={query.error ?? new Error('Unable to load profile.')} onRetry={query.reload} />}</ScreenContainer>;
  const cards = properties.data;
  return <ScreenContainer refreshing={query.isRefreshing || properties.isRefreshing} onRefresh={() => { void query.refresh(); void properties.refresh(); }}>
    {query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : null}
    <LandlordPublicProfileContent profile={query.data?.kind === 'landlord' ? query.data : undefined}
    onRequest={id && query.data && query.data.kind !== role && id !== user?.id && !query.error ? () => navigation.navigate('RequestConnect', { recipientId: id! }) : undefined}
    properties={!id ? <ContentStateView state={{ kind: 'unavailable', message: 'No landlord properties have been loaded.' }} />
      : properties.isLoading ? <LoadingState />
      : properties.error
        ? <ErrorState error={properties.error} onRetry={properties.reload} />
        : !cards?.length ? <ContentStateView state={{ kind: 'empty', message: 'No published properties available.' }} />
        : cards.map((property) => <Card key={property.id}><View style={styles.content}>
          <Text style={styles.heading}>{property.title || property.details.publicArea || property.city}</Text>
          <Text style={styles.body}>{property.details.publicArea || property.city} · {formatBedrooms(property.bedrooms)} · {formatRent(property.rentAmount, property.currency)}</Text>
          <Text style={styles.note}>{property.photos.length} {property.photos.length === 1 ? 'photo' : 'photos'}</Text>
          <Button label="View property" variant="secondary" onPress={() => navigation.navigate('PublicPropertyDetail', { propertyId: property.id, landlordId: id! })} />
        </View></Card>)} />
  </ScreenContainer>;
}
