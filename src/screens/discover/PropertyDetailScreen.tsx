import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { api, ApiError } from '../../lib/api';
import type { PublicProperty, PublicPropertyPhoto } from '../../lib/phase1Types';
import { formatBedrooms, formatRent, PROPERTY_RULE_LABELS } from '../../lib/properties';
import { useApiQuery } from '../../lib/useApiQuery';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';

export function isDemoHome(home: { listingStatus: string }): boolean {
  return home.listingStatus === 'demo_preview';
}

export function PropertyPhoto({ landlordId, propertyId, photo, compact = false }: { landlordId: string; propertyId: string; photo: PublicPropertyPhoto; compact?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const query = useApiQuery(`public-photo/${landlordId}/${propertyId}/${photo.id}`, () => api.getPublicPropertyPhoto(landlordId, propertyId, photo.id));
  const retry = () => { setFailedUrl(null); void query.reload(); };
  if (query.isLoading) return compact ? <View style={{ height: 75, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading property photo" /></View> : <LoadingState />;
  if (query.error || !query.data || query.data.url === failedUrl) return compact
    ? <Pressable accessibilityRole="button" accessibilityLabel="Property photo unavailable. Retry photo" onPress={retry} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.note}>Retry photo</Text></Pressable>
    : <ErrorState error={query.error ?? new Error('This photo could not be loaded. Try again for a fresh link.')} onRetry={retry} />;
  return <View style={{ gap: 12 }}>
    <Image source={{ uri: query.data.url }} accessibilityLabel={photo.caption || 'Property photo'} onError={() => setFailedUrl(query.data!.url)}
      style={{ width: '100%', aspectRatio: compact ? 16 / 10 : 4 / 3, borderRadius: compact ? 14 : 20 }} resizeMode={compact ? 'cover' : 'contain'} />
    {!compact && photo.caption ? <Text style={styles.body}>{photo.caption}</Text> : null}
  </View>;
}
function Gallery({ property }: { property: PublicProperty }) {
  const [selected, setSelected] = useState(0);
  const photos = property.photos;
  const index = Math.min(selected, Math.max(0, photos.length - 1));
  const photo = photos[index];
  return <View style={styles.content}>
    <Text style={styles.heading}>Photos</Text>
    {photo ? <>
      <PropertyPhoto key={photo.id} landlordId={property.landlordId} propertyId={property.id} photo={photo} />
      <Text style={styles.note}>Photo {index + 1} of {photos.length}</Text>
      <View style={styles.row}>
        <Button label="Previous photo" variant="secondary" disabled={index === 0} onPress={() => setSelected(index - 1)} />
        <Button label="Next photo" variant="secondary" disabled={index === photos.length - 1} onPress={() => setSelected(index + 1)} />
      </View>
    </> : <Text style={styles.note}>No photos supplied for this property.</Text>}
  </View>;
}
function PublicDetails({ property }: { property: PublicProperty }) {
  const d = property.details;
  const [linkError, setLinkError] = useState<string | null>(null);
  // Explicit public fields; never iterate over an API object to render its contents.
  const rows: [string, string | number | null | undefined][] = [
    ['Area', d.publicArea || property.city], ['Postcode district', d.postcodeDistrict],
    ['Deposit', d.depositAmount != null ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: property.currency }).format(d.depositAmount) : null],
    ['Available from', d.availableFrom], ['Minimum tenancy', d.minTenancyMonths ? `${d.minTenancyMonths} months` : null],
    ['Expected tenancy', d.expectedTenancyMonths ? `${d.expectedTenancyMonths} months` : null],
    ['Property type', d.propertyType], ['Bathrooms', d.bathrooms], ['Permitted occupants', d.permittedOccupants],
    ['Furnishing', d.furnishing?.replaceAll('_', ' ')], ['Bills included', d.billsIncluded?.join(', ').replaceAll('_', ' ')],
    ['Bills excluded', d.billsExcluded?.join(', ').replaceAll('_', ' ')], ['Council tax band', d.councilTaxBand], ['EPC', d.epcRating],
    ['HMO licence status (reported)', d.hmoLicenceStatus?.replaceAll('_', ' ')], ['Heating', d.heating], ['Parking', d.parking],
    ['Outdoor space', d.outdoorSpace], ['Accessibility', d.accessibilityFeatures?.join(', ')], ['Energy features', d.energyFeatures?.join(', ')],
    ['Pets', d.petsPolicy?.replaceAll('_', ' ')], ['Smoking', d.smokingPolicy?.replaceAll('_', ' ')], ['Other conditions', d.otherConditions],
  ];
  return <View style={styles.content}>
    {property.description ? <Card title="About this home"><Text style={styles.body}>{property.description}</Text></Card> : null}
    {d.keyFeatures?.length ? <Card title="Key features">{d.keyFeatures.map((feature, i) => <Text key={i} style={styles.body}>• {feature}</Text>)}</Card> : null}
    <Card><View style={styles.content}>{rows.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) =>
      <Text key={label} style={styles.body}>{label}: {value}</Text>)}</View></Card>
    <Text style={styles.heading}>Property rules</Text>
    <Text style={styles.body}>{property.propertyRules.map(rule => PROPERTY_RULE_LABELS[rule as keyof typeof PROPERTY_RULE_LABELS] ?? rule.replaceAll('_', ' ')).join(' · ') || 'No rules provided.'}</Text>
    {d.walkthroughUrl ? <Button label={d.walkthroughType === 'live' ? 'Open live walkthrough link' : 'Open video walkthrough'} variant="secondary" onPress={() => {
      setLinkError(null); void Linking.openURL(d.walkthroughUrl!).catch(() => setLinkError('Unable to open this walkthrough link.'));
    }} /> : null}
    {linkError ? <Text accessibilityRole="alert" style={styles.body}>{linkError}</Text> : null}
  </View>;
}

type Props = NativeStackScreenProps<DiscoverStackParamList, 'PublicPropertyDetail'>;
export function PropertyDetailScreen({ route }: Props) {
  const { propertyId, landlordId } = route.params;
  const query = useApiQuery(`public-property/${landlordId}/${propertyId}`, () => api.getPublicLandlordProperty(landlordId, propertyId));
  const property = query.data;
  const unavailable = query.error instanceof ApiError && [403, 404].includes(query.error.status);
  return <ScreenContainer refreshing={query.isRefreshing} onRefresh={() => void query.refresh()}><View style={styles.content}>
    {query.isLoading ? <LoadingState /> : unavailable ? <ContentStateView state={{ kind: 'empty', message: 'This property is no longer available.' }} />
      : !property ? <ErrorState error={query.error ?? new Error('Property unavailable.')} onRetry={query.reload} />
      : property.landlordId !== landlordId ? <Text style={styles.body}>This property is not available in this landlord profile.</Text>
      : <>
        {query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : null}
        <Text style={styles.title}>{property.title || property.details.publicArea || property.city}</Text>
        {isDemoHome(property) ? <Text style={styles.note}>Illustrative demo home · Not published</Text> : null}
        <Text style={styles.body}>{property.details.publicArea || property.city} · {formatBedrooms(property.bedrooms)}</Text>
        <Text style={styles.body}>{formatRent(property.rentAmount, property.currency)}</Text>
        <Gallery property={property} />
        <PublicDetails property={property} />
        <Text style={styles.note}>Full addresses stay private. This home is shown for information; it is not a reservation or tenancy agreement.</Text>
        <Text style={styles.note}>Return to the landlord profile to get to know the person behind this home.</Text>
      </>}
  </View></ScreenContainer>;
}
