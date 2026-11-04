import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { api, ApiError } from '../lib/api';
import { useApiQuery } from '../lib/useApiQuery';
import { Button } from './Button';
import { Card } from './Card';
import { ErrorState, LoadingState } from './QueryState';
import { screenStyles as styles } from './ScreenContainer';
import { StatusBadge } from './StatusBadge';

// Platform documents shared by both roles, before signup and in Settings.
// No acceptance or consent is sent merely by opening or registering.
export function LegalPreferences() {
  const { user } = useAuth();
  const documents = useApiQuery('legal/documents', api.legalDocuments);
  const privacy = useApiQuery(`privacy/${user?.id ?? 'anonymous'}`, () => user ? api.getPrivacy() : Promise.resolve(null));
  const [open, setOpen] = useState<'terms' | 'privacy_notice' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const docs = documents.data;
  async function record(action: 'terms' | 'notice') {
    if (!docs || !user) return;
    setBusy(action); setMessage(null); setError(null);
    try {
      if (action === 'terms') {
        const result = await api.acceptTerms(docs.terms.version);
        setMessage(`Terms ${result.version} accepted.`);
      } else if (action === 'notice') {
        const result = await api.acknowledgeNotice(docs.privacyNotice.version);
        setMessage(`Privacy notice ${result.version} acknowledged.`);
      }
      await privacy.reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setOpen(null); await documents.reload(); await privacy.reload();
        setError('The published documents changed. Review the latest versions before trying again.');
      } else setError(err instanceof Error ? err.message : 'Unable to record your choice. Nothing has been confirmed.');
    } finally { setBusy(null); }
  }
  return <View style={styles.content}>
    <Text accessibilityRole="header" style={styles.heading}>Lérí legal &amp; privacy</Text>
    <Text style={styles.note}>These Lérí platform documents apply to both renters and landlords.</Text>
    {documents.isLoading ? <LoadingState /> : documents.error ? <>
      <ErrorState error={documents.error} onRetry={documents.reload} />
      {documents.error instanceof ApiError && documents.error.status === 503 ? <Text style={styles.note}>Published terms and privacy notice are not both configured. Acceptance is unavailable; no substitute legal text is shown.</Text> : null}
    </> : null}
    {docs ? <>
      {([docs.terms, docs.privacyNotice]).map((doc) => <Card key={doc.id} title={doc.title}><View style={styles.content}>
        <Text style={styles.note}>Version {doc.version} · published {new Date(doc.publishedAt).toLocaleDateString()}</Text>
        {doc.demoOnly ? <StatusBadge label="Demo-only legal document" tone="highlight" /> : null}
        <Button label={`${open === doc.kind ? 'Hide' : 'Read'} ${doc.kind === 'terms' ? 'terms' : 'privacy notice'}`} variant="secondary" onPress={() => setOpen(open === doc.kind ? null : doc.kind)} />
        {open === doc.kind ? <>
          <Text selectable style={styles.body}>{doc.content}</Text>
          {user ? <Button disabled={busy !== null || documents.error !== null || !privacy.data || privacy.error !== null}
            loading={busy === (doc.kind === 'terms' ? 'terms' : 'notice')}
            label={doc.kind === 'terms' ? 'Accept these terms' : 'Acknowledge this privacy notice'}
            onPress={() => void record(doc.kind === 'terms' ? 'terms' : 'notice')} /> : null}
        </> : null}
      </View></Card>)}
      {!user ? <Text style={styles.note}>After signing in, record terms acceptance and privacy acknowledgement in Settings.</Text> : null}
      {user && privacy.isLoading ? <LoadingState /> : null}
      {user && privacy.error ? <ErrorState error={privacy.error} onRetry={privacy.reload} /> : null}

    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
  </View>;
}
