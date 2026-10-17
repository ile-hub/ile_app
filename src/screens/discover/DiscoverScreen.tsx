import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ListScreenContainer } from '../../components/ListScreenContainer';
import { ErrorState, LoadingState } from '../../components/QueryState';
import { screenStyles as styles } from '../../components/ScreenContainer';
import { ProfileVerification } from '../../components/StatusBadge';
import { api } from '../../lib/api';
import type { DiscoveryItem, DiscoveryMode, PublicProfile } from '../../lib/phase1Types';
import { mergeDiscoveryPages, profileSummary } from '../../lib/profiles';
import { useApiQuery } from '../../lib/useApiQuery';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';
import { colors } from '../../theme/colors';

function PersonCard({ item, onOpen }: { item: DiscoveryItem; onOpen: (profile: PublicProfile) => void }) {
  const { profile, reasons } = item;
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const name = profileSummary(profile.displayName) || (profile.kind === 'landlord' ? 'Landlord' : 'Renter');
  const location = profile.kind === 'renter' ? profile.preferredLocation : profile.locationsCovered.join(', ');
  return <Card style={{ marginTop: 20 }}><View style={styles.content}>
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      {profile.photoUrl && failedPhoto !== profile.photoUrl ? <Image source={{ uri: profile.photoUrl }} accessibilityLabel={`${name}'s profile photo`}
        onError={() => setFailedPhoto(profile.photoUrl)} style={{ width: 64, height: 64, borderRadius: 32 }} />
        : <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.title}>{name.charAt(0).toUpperCase()}</Text></View>}
      <View style={{ flex: 1 }}><Text style={styles.heading}>{name}</Text>
        <Text style={styles.note}>{profile.kind === 'landlord' ? 'Landlord' : 'Renter'}{location ? ` · ${location}` : ''}</Text></View>
    </View>
    <Text style={styles.body} numberOfLines={3}>{profileSummary(profile.bio) || 'Introduction not added yet.'}</Text>
    <ProfileVerification verification={profile.verification} />
    {profile.kind === 'landlord' ? <Text style={styles.note}>{profile.properties.length} available {profile.properties.length === 1 ? 'property' : 'properties'} in their profile</Text> : null}
    {reasons.length ? <View style={{ gap: 6 }}><Text style={styles.heading}>Why this suggestion</Text>
      {reasons.map((reason, index) => <Text key={`${index}:${reason}`} style={styles.body}>• {reason}</Text>)}
    </View> : null}
    <Button label="View profile" variant="secondary" onPress={() => onOpen(profile)} />
  </View></Card>;
}

export function DiscoverScreen({ navigation }: NativeStackScreenProps<DiscoverStackParamList, 'Discover'>) {
  const { role, user } = useAuth();
  const [mode, setMode] = useState<DiscoveryMode>('suggested');
  const query = useApiQuery(`discovery/${user?.id}/${role}/${mode}`, () => api.discover(mode), {
    cursor: page => page.nextCursor,
    fetchNext: cursor => api.discover(mode, cursor),
    merge: mergeDiscoveryPages,
  });
  const data = (query.data?.items ?? []).filter(item => item.profile.kind !== role);
  const more = !!query.data?.nextCursor;
  const open = (profile: PublicProfile) => profile.kind === 'landlord'
    ? navigation.navigate('LandlordProfile', { landlordId: profile.id })
    : navigation.navigate('RenterPublicProfile', { renterId: profile.id });
  return <ListScreenContainer<DiscoveryItem> key={mode} data={data} keyExtractor={item => item.profile.id}
    onRefresh={() => void query.refresh()} refreshing={query.isRefreshing}
    ListHeaderComponent={<View style={styles.content}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.body}>{role === 'renter' ? 'A good home starts with getting to know the people behind it.' : 'Meet the people who could call your property home.'}</Text>
      <Button label="Suggested for You" variant={mode === 'suggested' ? 'primary' : 'secondary'}
        accessibilityState={{ selected: mode === 'suggested' }} onPress={() => setMode('suggested')} />
      <Button label="Explore All" variant={mode === 'all' ? 'primary' : 'secondary'}
        accessibilityState={{ selected: mode === 'all' }} onPress={() => setMode('all')} />
      {query.error && data.length ? <ErrorState error={query.error} onRetry={query.reload} /> : null}
    </View>}
    ListEmptyComponent={query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} onRetry={query.reload} />
      : <Card style={{ marginTop: 20 }}><View style={{ gap: 16, alignItems: 'center', paddingVertical: 24 }}>
        <Ionicons name="people-outline" size={48} color={colors.accent} />
        <Text style={styles.heading}>{more ? 'Keep looking for a practical fit' : mode === 'suggested' ? 'No suggestions just yet' : 'No profiles to explore yet'}</Text>
        <Text style={[styles.body, { textAlign: 'center' }]}>{more ? 'There are more people to check. Keep looking, or switch to Explore All.'
          : mode === 'suggested' ? 'Try Explore All to meet people beyond these suggestions. You can also update your housing preferences.'
            : 'No public profiles are available right now. Pull down to refresh later.'}</Text>
      </View></Card>}
    ListFooterComponent={<View style={{ gap: 16, marginTop: 20 }}>
      {query.moreError ? <ErrorState error={query.moreError} onRetry={query.loadMore} /> : null}
      {more ? <Button label={data.length ? 'More people' : 'Keep looking'} loading={query.isLoadingMore} disabled={query.isRefreshing || !!query.error} variant="secondary" onPress={() => void query.loadMore()} /> : null}
    </View>}
    renderItem={({ item }) => <PersonCard item={item} onOpen={open} />} />;
}
