import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { useProfile } from '../../auth/ProfileProvider';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { ScreenContainer, screenStyles as styles } from '../../components/ScreenContainer';
import { StatusBadge } from '../../components/StatusBadge';
import { api, ApiError } from '../../lib/api';
import type { Connection, PublicProfile } from '../../lib/phase1Types';
import { CONNECTION_STATUS_LABELS, connectionIntroduction, profileSummary } from '../../lib/profiles';
import { useApiQuery } from '../../lib/useApiQuery';
import type { DiscoverStackParamList } from '../../navigation/DiscoverStack';
import { RenterPublicProfileContent } from '../discover/RenterPublicProfileScreen';
import { LandlordPublicProfileContent } from '../discover/LandlordProfileScreen';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'RequestConnect'>;
export function RequestConnectScreen({ route, navigation }: Props) {
  const { recipientId } = route.params;
  const { user, role } = useAuth();
  const own = useProfile();
  const recipient = useApiQuery(`request-recipient/${recipientId}`, () => api.getPublicProfile(recipientId));
  const [note, setNote] = useState('');
  const [mention, setMention] = useState('');
  const [reviewed, setReviewed] = useState<string | null>(null);
  const [preview, setPreview] = useState<PublicProfile | null>(null);
  const [operation, setOperation] = useState<'review' | 'send' | null>(null);
  const busy = operation !== null;
  const lock = useRef(false);
  const [error, setError] = useState<Error | null>(null);
  const [sent, setSent] = useState<Connection | null>(null);
  const validRecipient = !!recipient.data && recipient.data.id !== user?.id && recipient.data.kind !== role && !recipient.error;
  let introduction = '', validation = '';
  try { introduction = connectionIntroduction(note, mention); } catch (error) { validation = (error as Error).message; }
  async function reviewDraft() {
    if (lock.current) return;
    lock.current = true; setOperation('review'); setError(null); setReviewed(null); setPreview(null);
    try {
      const publicProfile = await api.getProfilePreview();
      setPreview(publicProfile); setReviewed(introduction);
    } catch (error) { setError(error instanceof Error ? error : new Error('Unable to load your public preview.')); }
    finally { lock.current = false; setOperation(null); }
  }
  async function send() {
    if (lock.current || sent || !validRecipient || !own.profile?.discoverable || !preview || reviewed !== introduction || !introduction) return;
    lock.current = true; setOperation('send'); setError(null);
    try { setSent(await api.createConnection({ recipientId, introduction })); }
    catch (error) { setError(error instanceof Error ? error : new Error('Unable to send your request. Your draft has been kept.')); }
    finally { lock.current = false; setOperation(null); }
  }
  if (sent) return <ScreenContainer><View style={styles.content}>
    <Text style={styles.title}>Request sent</Text><StatusBadge label={CONNECTION_STATUS_LABELS[sent.status]} />
    <Text style={styles.body}>Your introduction has been saved. Find it in the Outgoing view of Connections.</Text>
    <Text style={styles.body}>Connecting does not reserve a property or establish a tenancy agreement.</Text>
    <Button label="Back to profile" onPress={() => navigation.goBack()} />
  </View></ScreenContainer>;
  return <ScreenContainer><View style={styles.content}>
    <Text style={styles.title}>{recipient.data ? `Connect with ${profileSummary(recipient.data.displayName) || 'this person'}` : 'Request to Connect'}</Text>
    {recipient.isLoading ? <LoadingState /> : recipient.error ? <ErrorState error={recipient.error} onRetry={recipient.reload} />
      : !validRecipient ? <ContentStateView state={{ kind: 'unavailable', message: 'Choose an available public profile with the other role.' }} /> : null}
    {own.isLoading ? <LoadingState /> : own.error ? <ErrorState error={own.error} onRetry={own.reload} /> : null}
    {!own.isLoading && !own.profile?.discoverable ? <Text style={styles.body}>Make your profile discoverable in Edit Profile before sending an introduction.</Text> : null}
    <Text style={styles.body}>What caught your attention? Tell them a little about yourself and why you’d like to connect.</Text>
    <FormInput label="Your personalised note" multiline maxLength={3000} value={note} editable={!busy}
      onChangeText={value => { setNote(value); setReviewed(null); }} placeholder="Hi, I’m Lewis. I’d love to chat about your one-bedroom home in the West End. It looks like an ideal fit for the next year—and hopefully longer." />
    <FormInput label="Property mention (optional)" value={mention} maxLength={200} editable={!busy}
      onChangeText={value => { setMention(value); setReviewed(null); }} placeholder="Mention a property if you wish" />
    <Text style={styles.note}>This introduction is to a person, not a property application. The complete note may contain up to 3,000 characters.</Text>
    {note && validation ? <Text accessibilityRole="alert" style={styles.body}>{validation}</Text> : null}
    <Button label="Review introduction and sharing" variant="secondary" disabled={!!validation || !validRecipient || busy} loading={operation === 'review'} onPress={() => void reviewDraft()} />
    {reviewed && preview ? <Card><View style={styles.content}>
      <Text style={styles.heading}>Your introduction</Text><Text style={styles.body}>{reviewed}</Text>
      <Text style={styles.heading}>What they can see</Text>
      {preview.kind === 'renter' ? <RenterPublicProfileContent profile={preview} label="Saved public preview" />
        : <LandlordPublicProfileContent profile={preview} label="Saved public preview" />}
      <Text style={styles.note}>Your saved public profile and safe evidence summaries are shared. Private documents and explanations stay private.</Text>
    </View></Card> : null}
    {error ? <><Text accessibilityRole="alert" style={styles.body}>{error.message}</Text>
      {error instanceof ApiError && error.status === 409 ? <Text style={styles.note}>A request already exists between you. Check Incoming, Outgoing or Accepted in Connections; a declined request cannot be resent.</Text> : null}</> : null}
    <Button label="Send request" loading={operation === 'send'} disabled={busy || !validRecipient || !own.profile?.discoverable || !preview || reviewed !== introduction || !!validation || error instanceof ApiError && error.status === 409} onPress={() => void send()} />
    <Text style={styles.note}>A connection does not guarantee a viewing, approval, reservation or tenancy. Drafts close with this screen.</Text>
  </View></ScreenContainer>;
}
