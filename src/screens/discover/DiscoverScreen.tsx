import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { ProfilePortrait } from '../../components/ProfilePortrait';
import { Card } from '../../components/Card';
import { ListScreenContainer } from '../../components/ListScreenContainer';
import { ErrorState, LoadingState } from '../../components/QueryState';
import { screenStyles as styles } from '../../components/ScreenContainer';
import { formatRent } from '../../lib/properties';
import { formatCalendarDate, formatMonthlyBudget } from '../../lib/formatting';
import { api } from '../../lib/api';
import type { DiscoveryItem, DiscoveryMode, PublicProfile } from '../../lib/phase1Types';
import { discoveryCompatibilitySentence, mergeDiscoveryPages, profileSummary } from '../../lib/profiles';
import { isDemoHome, PropertyPhoto } from './PropertyDetailScreen';
import { useApiQuery } from '../../lib/useApiQuery';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';
import { colors } from '../../theme/colors';

// Presentation follows the API; no fixture IDs or additional eligibility rules.
function PersonCard({ item, suggested, onOpen }: { item: DiscoveryItem; suggested: boolean; onOpen: (profile: PublicProfile) => void }) {
  const { profile, reasons } = item;
  const name = profileSummary(profile.displayName) || (profile.kind === 'landlord' ? 'Landlord' : 'Renter');
  const location = profile.kind === 'renter' ? profile.preferredLocation : profile.locationsCovered.join(', ');
  const introduction = profileSummary(profile.kind === 'renter' ? profile.personalStory || profile.bio : profile.bio);
  // Prefer a word boundary before the native three-line accessibility/layout cap.
  const excerpt = introduction.length > 120 ? `${introduction.slice(0, 120).replace(/\s+\S*$/, '')}…` : introduction;
  const homes = profile.kind === 'landlord' ? profile.properties : [];
  const home = homes.find(property => property.photos.length > 0);
  const previews = homes.filter(isDemoHome).length;
  const renter = profile.kind === 'renter';
  const budget = renter ? formatMonthlyBudget(profile.budgetMin, profile.budgetMax).replace(' per month', '/month') : 'Not provided';
  const moveDate = renter ? formatCalendarDate(profile.targetMoveDate) : 'Not provided';
  const compatibility = suggested && renter ? discoveryCompatibilitySentence(reasons) : null;
  return <Card style={cardStyles.card}>
    <View style={[cardStyles.content, renter && cardStyles.renterContent]}>
      <View style={cardStyles.identity}>
        <ProfilePortrait profile={profile} accessibilityLabel={`${name}'s profile photo`} style={cardStyles.portrait}
          fallback={<View style={[cardStyles.portrait, cardStyles.initial]}><Text style={cardStyles.name}>{name.charAt(0).toUpperCase()}</Text></View>} />
        <View style={cardStyles.identityText}>
          <Text style={cardStyles.name}>{name}</Text>
          <Text style={cardStyles.role}>{renter ? `Renter${location ? ` · ${location}` : ''}` : 'Landlord'}</Text>
          {!renter && location ? <Text style={cardStyles.location}>{location}</Text> : null}
          {renter && budget !== 'Not provided' ? <Text style={cardStyles.budget}>{budget}</Text> : null}
        </View>
      </View>
      <Text numberOfLines={3} ellipsizeMode="tail" style={cardStyles.introduction}>{excerpt || 'Get to know this person in their profile.'}</Text>
      {renter && moveDate !== 'Not provided' ? <Text style={cardStyles.location}>Moving {moveDate}</Text> : null}
      {profile.kind === 'landlord' && homes.length > 0 ? <View style={cardStyles.homes}>
        <Text style={cardStyles.sectionTitle}>{homes.length} {homes.length === 1 ? 'home' : 'homes'} to explore in their profile</Text>
        {home ? <>
          <View style={cardStyles.thumbnail}><PropertyPhoto compact landlordId={profile.id} propertyId={home.id} photo={home.photos[0]} /></View>
          <Text style={cardStyles.homeCaption}>{home.details.publicArea || home.city} · {formatRent(home.rentAmount, home.currency)}</Text>
        </> : null}
        {previews > 0 ? <Text style={cardStyles.disclosure}>{previews} illustrative demo {previews === 1 ? 'home' : 'homes'} · Not published</Text> : null}
      </View> : null}
      {compatibility ? <Text style={cardStyles.compatibility}>{compatibility}</Text> : null}
      {!renter && suggested && reasons.length > 0 ? <View style={cardStyles.reasons}>
        {reasons.slice(0, 2).map((reason, index) => <View key={`${index}:${reason}`} style={cardStyles.reason}>
          <Ionicons name="checkmark" size={17} color={colors.accent} accessibilityElementsHidden importantForAccessibility="no" />
          <Text numberOfLines={2} ellipsizeMode="tail" style={cardStyles.reasonText}>{reason}</Text>
        </View>)}
      </View> : null}
      <Button label="View Profile" accessibilityLabel={`View ${name}'s profile`} onPress={() => onOpen(profile)} />
    </View>
  </Card>;
}
const cardStyles = StyleSheet.create({
  card: { marginTop: 20, backgroundColor: colors.surface, borderColor: '#E5E5DD', borderRadius: 24, padding: 22 },
  content: { gap: 14 },
  renterContent: { gap: 12 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  portrait: { width: 96, height: 112, borderRadius: 18 },
  initial: { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  identityText: { flex: 1, gap: 5 },
  name: { color: colors.textPrimary, fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.5 },
  role: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  location: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  introduction: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  budget: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  compatibility: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  homes: { gap: 10 },
  thumbnail: { width: 120, maxWidth: '100%' },
  sectionTitle: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  homeCaption: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  reasons: { gap: 9, borderTopColor: '#ECECE6', borderTopWidth: 1, paddingTop: 16 },
  reason: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reasonText: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  disclosure: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});

export function DiscoverScreen({ navigation }: NativeStackScreenProps<DiscoverStackParamList, 'Discover'>) {
  const { role, user } = useAuth();
  const [mode, setMode] = useState<DiscoveryMode>('suggested');
  const query = useApiQuery(`discovery/${user?.id}/${role}/${mode}`, () => api.discover(mode), {
    cursor: page => page.nextCursor,
    fetchNext: cursor => api.discover(mode, cursor),
    merge: mergeDiscoveryPages,
  });
  // Revisit/focus already reloads via useApiQuery. Also refresh after the app
  // resumes, so a response cached before an API restart is not left on screen.
  const focused = useIsFocused();
  const reload = query.reload;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active' && focused) void reload();
    });
    return () => subscription.remove();
  }, [focused, reload]);
  const data = query.data?.items ?? [];
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
      {mode === 'all' ? <Text style={styles.note}>Meet people beyond your suggestions. Evidence preferences do not limit who you can discover.</Text> : null}
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
    renderItem={({ item }) => <PersonCard item={item} suggested={mode === 'suggested'} onOpen={open} />} />;
}
