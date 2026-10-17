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
  const sections = [
    ['bio', 'About'], ['companyName', 'Business name'], ['landlordType', 'Landlord type'],
    ['communicationStyle', 'Communication style'], ['lettingApproach', 'Letting approach'],
    ['tenantExpectations', 'What can a great tenant expect from you as a landlord?'],
    ['tenancySuccess', 'What makes a tenancy work well for you?'],
  ] as const;
  return <View style={styles.content}>
    {label || !profile ? <StatusBadge label={label ?? 'Layout only · no profile loaded'} tone="highlight" /> : null}
    <Text style={styles.title}>{profileSummary(profile?.displayName) || 'Landlord profile'}</Text>
    {profile?.photoUrl ? <Image source={{ uri: profile.photoUrl }} accessibilityLabel="Public landlord portrait" style={{ width: 80, height: 80, borderRadius: 40 }} /> : null}
    {profile ? <ProfileVerification verification={profile.verification} /> : <StatusBadge label="Verification unavailable" />}
    {sections.map(([key, title]) => <Card key={key}><Text style={styles.heading}>{title}</Text><Text style={styles.body}>{profileSummary(profile?.[key]) || 'Not provided.'}</Text></Card>)}
    <Card><View style={styles.content}>
      <Text style={styles.heading}>Letting experience and locations</Text>
      <Text style={styles.body}>Experience: {profile?.lettingExperienceYears != null ? `${profile.lettingExperienceYears} years` : 'Not provided'}</Text>
      <Text style={styles.body}>Self-declared portfolio: {profile?.numberOfProperties ?? 'Not provided'}</Text>
      <Text style={styles.body}>Locations: {profile?.locationsCovered.join(', ') || 'Not provided'}</Text>
    </View></Card>
    <Card><View style={styles.content}><Text style={styles.heading}>ARCS priorities</Text>
      {profile?.arcsPreferences ? profile.arcsPreferences.priorityOrder.map((pillar, index) => <Text key={pillar} style={styles.body}>{index + 1}. {TRUST_PILLARS.find(item => item.id === pillar)?.label}</Text>)
        : <Text style={styles.note}>No preferences loaded.</Text>}
      <Text style={styles.note}>Evidence preferences provide context, and never restrict who appears in discovery.</Text>
    </View></Card>
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
