import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { api, ApiError } from '../lib/api';
import { useApiQuery } from '../lib/useApiQuery';
import type { ConsentPurpose, PrivacyState } from '../lib/phase1Types';
import { Button } from './Button';
import { Card } from './Card';
import { ErrorState, LoadingState } from './QueryState';
import { screenStyles as styles } from './ScreenContainer';
import { StatusBadge } from './StatusBadge';

// Same legal interface before signup (read only) and in the account profile.
// No acceptance or consent is sent merely by opening or registering.
export function LegalPreferences() {
  const { user } = useAuth();
  const documents = useApiQuery('legal/documents', api.legalDocuments);
  const privacy = useApiQuery(`privacy/${user?.id ?? 'anonymous'}`, () => user ? api.getPrivacy() : Promise.resolve(null));
  const [open, setOpen] = useState<'terms' | 'privacy_notice' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    source: PrivacyState | null | undefined; choices: Partial<Record<ConsentPurpose, boolean>>;
    termsVersion?: string; noticeVersion?: string;
  }>({ source: undefined, choices: {} });
  const docs = documents.data;
  const confirmations = confirmed.source === privacy.data ? confirmed : null;
  async function record(action: 'terms' | 'notice' | ConsentPurpose, granted?: boolean) {
    if (!docs || !user) return;
    setBusy(action); setMessage(null); setError(null);
    try {
      if (action === 'terms') {
        const result = await api.acceptTerms(docs.terms.version);
        setConfirmed((current) => ({ source: privacy.data, choices: current.source === privacy.data ? current.choices : {}, termsVersion: result.version }));
        setMessage(`Terms ${result.version} accepted.`);
      } else if (action === 'notice') {
        const result = await api.acknowledgeNotice(docs.privacyNotice.version);
        setConfirmed((current) => ({ source: privacy.data, choices: current.source === privacy.data ? current.choices : {}, noticeVersion: result.version }));
        setMessage(`Privacy notice ${result.version} acknowledged.`);
      } else {
        const result = await api.setConsent(action, granted === true, docs.privacyNotice.version);
        setConfirmed((current) => ({ source: privacy.data, choices: { ...(current.source === privacy.data ? current.choices : {}), [action]: result.granted } }));
        setMessage(`Optional ${result.purpose.replace('_', ' ')} consent ${result.granted ? 'granted' : 'withdrawn'}.`);
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
    <Text style={styles.heading}>Privacy, terms and your choices</Text>
    {documents.isLoading ? <LoadingState /> : documents.error ? <>
      <ErrorState error={documents.error} onRetry={documents.reload} />
      {documents.error instanceof ApiError && documents.error.status === 503 ? <Text style={styles.note}>Published terms and privacy notice are not both configured. Acceptance is unavailable; no substitute legal text is shown.</Text> : null}
    </> : null}
    {docs ? <>
      {([docs.terms, docs.privacyNotice]).map((doc) => <Card key={doc.id}><View style={styles.content}>
        <Text style={styles.heading}>{doc.title}</Text>
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
      {!user ? <Text style={styles.note}>After signing in, record terms acceptance and privacy acknowledgement in your profile settings. Optional consent is separate and is never enabled by signing up.</Text> : null}
      {user && privacy.isLoading ? <LoadingState /> : null}
      {user && privacy.error ? <ErrorState error={privacy.error} onRetry={privacy.reload} /> : null}
      {user && privacy.data ? <>
        <Text style={styles.body}>Current terms: {(confirmations?.termsVersion === docs.terms.version || privacy.data.termsAcceptances.some((item) => item.version === docs.terms.version)) ? 'acceptance recorded' : 'not yet accepted'}.</Text>
        <Text style={styles.body}>Current privacy notice: {(confirmations?.noticeVersion === docs.privacyNotice.version || privacy.data.privacyAcknowledgements.some((item) => item.version === docs.privacyNotice.version)) ? 'acknowledgement recorded' : 'not yet acknowledged'}.</Text>
        <Text style={styles.heading}>Optional consent</Text>
        <Text style={styles.note}>Optional choices start off and can be withdrawn. They are separate from terms acceptance and privacy acknowledgement.</Text>
        {(['product_updates', 'user_research'] as const).map((purpose) => {
          const current = confirmations?.choices[purpose] ?? privacy.data?.consents.find((item) => item.purpose === purpose)?.granted ?? false;
          return <View key={purpose} style={styles.content}>
            <Text style={styles.body}>{purpose === 'product_updates' ? 'Product updates' : 'User research'}: {current ? 'on' : 'off'}</Text>
            <Button label={`${current ? 'Withdraw' : 'Grant'} optional ${purpose.replace('_', ' ')} consent`} variant="secondary"
              loading={busy === purpose} disabled={busy !== null || documents.error !== null || privacy.error !== null}
              onPress={() => void record(purpose, !current)} />
          </View>;
        })}
      </> : null}
    </> : null}
    {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
  </View>;
}
