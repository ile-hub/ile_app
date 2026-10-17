import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ListScreenContainer } from '../../components/ListScreenContainer';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';
import type { Connection } from '../../lib/phase1Types';
import { canMessageConnection, CONNECTION_STATUS_LABELS, connectionFilter, mergeConnectionPages, profileSummary } from '../../lib/profiles';
import { useApiQuery } from '../../lib/useApiQuery';
import type { ConnectionsStackParamList } from '../../navigation/ConnectionsStack';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'Connections'>;
export function ConnectionsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [section, setSection] = useState<'Incoming' | 'Outgoing' | 'Accepted'>('Incoming');
  const [showExisting, setShowExisting] = useState(false);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const filter = connectionFilter(section);
  const connections = useApiQuery(`connections/${user?.id}/${section}`, () => api.listConnections(filter), {
    cursor: page => page.nextCursor, fetchNext: cursor => api.listConnections(filter, cursor), merge: mergeConnectionPages,
  });
  const existing = useApiQuery(`existing-interests/${user?.id}`, async () => {
    const [active, declined] = await Promise.all([api.listMyInterests(), api.listMyInterests('declined')]);
    return [...new Map([...active, ...declined].map(row => [row.id, row])).values()]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });
  const data = (connections.data?.items ?? []).filter(row => row.senderId === user?.id || row.recipientId === user?.id);
  return <ListScreenContainer<Connection> key={section} data={data} keyExtractor={row => row.id}
    onRefresh={() => { void connections.refresh(); void existing.refresh(); }} refreshing={connections.isRefreshing || existing.isRefreshing}
    ListHeaderComponent={<View style={styles.content}>
      <Text style={styles.title}>Connections</Text><Text style={styles.body}>A place to get to know each other.</Text>
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSage, borderRadius: 24, padding: 4 }}>
        {(['Incoming', 'Outgoing', 'Accepted'] as const).map(label => <Pressable key={label} accessibilityRole="tab"
          accessibilityState={{ selected: section === label }} onPress={() => setSection(label)}
          style={{ flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: section === label ? colors.accent : 'transparent' }}>
          <Text style={{ color: section === label ? colors.onAccent : colors.accent, fontWeight: '700', fontSize: 14 }}>{label}</Text>
        </Pressable>)}
      </View>
      {connections.error && data.length ? <ErrorState error={connections.error} onRetry={connections.reload} /> : null}
    </View>}
    ListEmptyComponent={connections.isLoading ? <LoadingState /> : connections.error ? <ErrorState error={connections.error} onRetry={connections.reload} />
      : <ContentStateView state={{ kind: 'empty', message: section === 'Incoming' ? 'No incoming introductions yet. Meet people in Discover.' : section === 'Outgoing' ? 'Your introductions will appear here after you send a request.' : 'Accepted connections will appear here when both people agree to connect.' }} />}
    renderItem={({ item }) => section === 'Accepted' ? <Pressable accessibilityRole="button"
      accessibilityLabel={`Message ${profileSummary(item.counterparty?.displayName) || 'connected person'}`}
      accessibilityHint="Opens your conversation"
      accessibilityState={{ disabled: !canMessageConnection(item, user?.id) }}
      disabled={!canMessageConnection(item, user?.id)}
      onPress={() => navigation.navigate('Conversation', { connectionId: item.id })}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 88, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border })}>
        {item.counterparty?.photoUrl && !failedPhotos.includes(item.counterparty.photoUrl) ? <Image
          source={{ uri: item.counterparty.photoUrl }} accessibilityLabel="Profile photo"
          onError={() => { const url = item.counterparty?.photoUrl; if (url) setFailedPhotos(previous => [...previous, url]); }}
          style={{ width: 48, height: 48, borderRadius: 24 }} />
          : <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentMuted, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.heading}>{(profileSummary(item.counterparty?.displayName) || 'Person').charAt(0)}</Text></View>}
        <View style={{ flex: 1, gap: 5 }}><Text style={[styles.heading, { fontSize: 17 }]}>{profileSummary(item.counterparty?.displayName) || 'Connected person'}</Text>
          <Text style={styles.note}>{canMessageConnection(item, user?.id) ? 'Connected · Tap to open conversation' : 'Connected · Conversation unavailable'}</Text></View>
    </Pressable> : <Card style={{ marginTop: 20 }}><View style={styles.content}>
      <Text style={styles.heading}>{profileSummary(item.counterparty?.displayName) || 'Public profile unavailable'}</Text>
      <StatusBadge label={CONNECTION_STATUS_LABELS[item.status]} />
      <Text style={styles.note}>{item.direction === 'incoming' ? 'Received introduction' : 'Your introduction'}</Text>
      <Text style={styles.body} numberOfLines={4}>{item.introduction}</Text>
      <Button label={item.status === 'accepted' ? 'View connection' : 'Review request'} variant="secondary" onPress={() => navigation.navigate('ConnectionDetail', { connectionId: item.id })} />
    </View></Card>}
    ListFooterComponent={<View style={{ gap: 16, marginTop: 20 }}>
      {connections.moreError ? <ErrorState error={connections.moreError} onRetry={connections.loadMore} /> : null}
      {connections.data?.nextCursor ? <Button label="More connections" loading={connections.isLoadingMore} disabled={connections.isRefreshing || !!connections.error} variant="secondary" onPress={() => void connections.loadMore()} /> : null}
      <Text style={styles.note}>Connecting does not reserve a home or establish a tenancy agreement.</Text>
      {existing.error ? <ErrorState error={existing.error} onRetry={existing.reload} /> : null}
      {existing.data?.length ? <Button label={showExisting ? 'Hide earlier property enquiries' : 'Earlier property enquiries'} variant="secondary" onPress={() => setShowExisting(!showExisting)} /> : null}
      {showExisting ? existing.data?.map(interest => <Card key={interest.id}><View style={styles.content}>
        <Text style={styles.heading}>{profileSummary(interest.counterparty.displayName) || 'Earlier property enquiry'}</Text>
        <StatusBadge label={`Property enquiry · ${interest.status}`} />
        <Text style={styles.note}>This earlier property interest is separate from person-to-person connections.</Text>
        <Button label="Review earlier enquiry" variant="secondary" onPress={() => navigation.navigate('ConnectionDetail', { interestId: interest.id })} />
      </View></Card>) : null}
    </View>} />;
}
