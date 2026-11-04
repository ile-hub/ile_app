import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import type { Connection, ConnectionDecision } from '../../lib/phase1Types';
import { canDecideConnection, CONNECTION_STATUS_LABELS, profileSummary } from '../../lib/profiles';
import { RenterPublicProfileContent } from '../discover/RenterPublicProfileScreen';
import { LandlordPublicProfileContent } from '../discover/LandlordProfileScreen';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { api, ApiError } from '../../lib/api';
import { useApiQuery } from '../../lib/useApiQuery';
import type { ConnectionsStackParamList } from '../../navigation/ConnectionsStack';

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'ConnectionDetail'>;
function LegacyInterestDetail({ navigation, route }: Props) {
  const id = route.params.interestId;
  const query = useApiQuery(`existing-interest/${id ?? 'unavailable'}`, () => id ? api.getInterest(id) : Promise.resolve(null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function act(action: 'reciprocate' | 'decline') {
    const interest = query.data;
    if (!interest) return;
    setBusy(true); setError(null);
    try {
      if (action === 'reciprocate') await api.expressInterest({ propertyId: interest.propertyId, renterId: interest.renterId });
      else await api.declineInterest(interest.id);
      await query.reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update existing interest.'); }
    finally { setBusy(false); }
  }
  if (id && query.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (id && !query.data) return <ScreenContainer><ErrorState error={query.error ?? new Error('Interest unavailable.')} onRetry={query.reload} /></ScreenContainer>;
  const data = query.data;
  return <ScreenContainer><View style={styles.content}>
    <StatusBadge label={data ? `Existing property interest · ${data.status}` : 'Layout only · no request loaded'} tone="highlight" />
    <Text style={styles.title}>{data?.counterparty.displayName ?? 'Incoming request'}</Text>
    <Card><Text style={styles.heading}>Their personalised note</Text><Text style={styles.body}>{data ? 'The existing property-interest API does not supply a personalised note.' : 'No request has been loaded.'}</Text></Card>
    <Card><Text style={styles.heading}>Public profile, preferences and ARCS summary</Text><Text style={styles.body}>Not available yet. Private evidence documents are never included here.</Text></Card>
    <Button label="Back to Connections" variant="secondary" onPress={() => navigation.goBack()} />
    {data ? <>
      <Text style={styles.heading}>Manage existing property interest</Text>
      <Text style={styles.note}>These controls update the existing property-interest record, not a new person-to-person connection.</Text>
      {data.status === 'pending' && data.viewerSide === 'landlord' ? <Button label="Confirm existing property interest" disabled={busy} onPress={() => void act('reciprocate')} /> : null}
      {data.status === 'pending' || data.status === 'matched' ? <Button label="Decline existing interest" disabled={busy} variant="secondary" onPress={() => void act('decline')} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
    </> : null}
  </View></ScreenContainer>;
}


export function ConnectionDetailScreen(props: Props) {
  return props.route.params.interestId ? <LegacyInterestDetail {...props} /> : <PersonConnectionDetail {...props} />;
}
function PersonConnectionDetail({ navigation, route }: Props) {
  const id = route.params.connectionId!;
  const { user } = useAuth();
  const query = useApiQuery(`connection/${user?.id}/${id}`, () => api.getConnection(id));
  const [confirmed, setConfirmed] = useState<Connection | null>(null);
  const [operation, setOperation] = useState<ConnectionDecision | null>(null);
  const busy = operation !== null;
  const lock = useRef(false);
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const data = confirmed?.id === id && (!query.data || Date.parse(query.data.updatedAt) < Date.parse(confirmed.updatedAt) || query.data.updatedAt === confirmed.updatedAt && query.data.status !== confirmed.status) ? confirmed : query.data;
  async function decide(action: ConnectionDecision) {
    if (lock.current || !data || !canDecideConnection(data, user?.id) || query.error) return;
    lock.current = true; setOperation(action); setError(null); setMessage(null);
    try {
      const saved = await api.decideConnection(id, action);
      setConfirmed(saved);
      void query.reload();
      setMessage(action === 'decline' ? 'Request declined.' : action === 'review-later' ? 'Saved for later review.' : 'Connection accepted.');
      if (saved.status === 'accepted' && navigation.isFocused()) navigation.replace('Connected', { connectionId: saved.id });
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unable to update this request.'));
      await query.reload();
    } finally { lock.current = false; setOperation(null); }
  }
  const inaccessible = query.error instanceof ApiError && [403, 404].includes(query.error.status);
  if (query.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (inaccessible) return <ScreenContainer><ContentStateView state={{ kind: 'unavailable', message: 'This request is unavailable to your account.' }} /></ScreenContainer>;
  if (!data || !user || ![data.senderId, data.recipientId].includes(user.id)) return <ScreenContainer><ErrorState error={query.error ?? new Error('Request unavailable.')} onRetry={query.reload} /></ScreenContainer>;
  const profile = data.counterparty;
  return <ScreenContainer refreshing={query.isRefreshing} onRefresh={busy ? undefined : () => { void query.refresh(); }}><View style={styles.content}>
    <Text style={styles.title}>{profileSummary(profile?.displayName) || 'Connection request'}</Text>
    <StatusBadge label={CONNECTION_STATUS_LABELS[data.status]} />
    <Card><Text style={styles.heading}>{data.senderId === user.id ? 'Your introduction' : 'Their introduction'}</Text><Text style={styles.body}>{data.introduction}</Text></Card>
    {query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : null}
    {profile ? profile.kind === 'renter' ? <RenterPublicProfileContent profile={profile} label="Public profile" /> : <LandlordPublicProfileContent profile={profile} label="Public profile" />
      : <Text style={styles.body}>Their public profile is no longer available. Private information is not shown.</Text>}
    {canDecideConnection(data, user.id) ? <>
      <Button label="Accept connection" loading={operation === 'accept'} disabled={busy || query.isRefreshing || !!query.error} onPress={() => void decide('accept')} />
      <Button label="Decline request" loading={operation === 'decline'} variant="secondary" disabled={busy || query.isRefreshing || !!query.error} onPress={() => void decide('decline')} />
      <Button label="Review later" loading={operation === 'review-later'} variant="secondary" disabled={busy || query.isRefreshing || !!query.error || data.status === 'review_later'} onPress={() => void decide('review-later')} />
    </> : data.senderId === user.id && (data.status === 'pending' || data.status === 'review_later') ? <Text style={styles.body}>Waiting for their decision. Only the recipient can accept or decline.</Text> : null}
    {data.status === 'accepted' ? <>
      <Text style={styles.heading}>You’re Connected! <Text accessibilityRole="image" accessibilityLabel="Handshake">🤝</Text></Text><Text style={styles.body}>Find this person in Accepted to chat.</Text>
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.body}>{error.message}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
    <Text style={styles.note}>A connection does not guarantee a viewing, property, approval, reservation or tenancy agreement.</Text>
  </View></ScreenContainer>;
}
