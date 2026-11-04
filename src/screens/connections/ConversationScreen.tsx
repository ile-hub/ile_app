import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthProvider';
import { ProfilePortrait } from '../../components/ProfilePortrait';
import { Button } from '../../components/Button';
import { ContentStateView, ErrorState, LoadingState } from '../../components/QueryState';
import { api, ApiError } from '../../lib/api';
import type { Message } from '../../lib/phase1Types';
import { canMessageConnection, mergeMessagePages, profileSummary } from '../../lib/profiles';
import { useApiQuery } from '../../lib/useApiQuery';
import { colors } from '../../theme/colors';
import type { ConnectionsStackParamList } from '../../navigation/ConnectionsStack';

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'Conversation'>;
const denied = (error: Error | null) => error instanceof ApiError && [403, 404, 409].includes(error.status);
export function ConversationScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  return <ConversationContent key={`${user?.id}/${route.params.connectionId}`} connectionId={route.params.connectionId} onBack={() => navigation.goBack()} />;
}
function ConversationContent({ connectionId, onBack }: { connectionId: string; onBack: () => void }) {
  const { user } = useAuth();
  const connection = useApiQuery(`chat-connection/${user?.id}/${connectionId}`, () => api.getConnection(connectionId));
  const eligible = !!connection.data && !connection.error && canMessageConnection(connection.data, user?.id);
  const history = useApiQuery(`messages/${user?.id}/${connectionId}/${eligible}`, () => eligible ? api.listMessages(connectionId) : Promise.resolve(null), {
    cursor: page => page?.nextCursor ?? null,
    fetchNext: cursor => api.listMessages(connectionId, cursor),
    merge: (current, next) => current && next ? mergeMessagePages(current, next) : next,
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Message[]>([]);
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lock = useRef(false);
  const list = useRef<FlatList<Message>>(null);
  const nearBottom = useRef(true);
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const blocked = !eligible || denied(history.error) || denied(history.moreError) || denied(error);
  const text = draft.trim();
  function followLatest() {
    if (nearBottom.current) requestAnimationFrame(() => list.current?.scrollToEnd({ animated: false }));
  }
  async function refresh() {
    if (lock.current) return;
    setError(null);
    await connection.refresh();
    await history.refresh();
  }
  async function send() {
    if (lock.current || blocked || history.isLoading || history.error || connection.isRefreshing || history.isRefreshing || !text || text.length > 4000) return;
    lock.current = true; setSending(true); setError(null); setSendConfirmed(false);
    try {
      const saved = await api.sendMessage(connectionId, text);
      nearBottom.current = true;
      setSent(previous => [...previous, saved]); setDraft(''); setSendConfirmed(true);
      // Never retry POST automatically: the contract has no idempotency key.
    } catch (error) { setError(error instanceof Error ? error : new Error('Unable to send. Your draft has been kept.')); }
    finally { lock.current = false; setSending(false); }
  }
  const person = connection.error ? null : connection.data?.counterparty;
  const name = profileSummary(person?.displayName) || 'Connected person';
  const messages = mergeMessagePages(history.data ?? { items: [], nextCursor: null }, { items: sent, nextCursor: null }).items
    .filter(message => message.connectionId === connectionId && connection.data && [connection.data.senderId, connection.data.recipientId].includes(message.senderId));
  const disabled = sending || blocked || connection.isLoading || history.isLoading || !!history.error || connection.isRefreshing || history.isRefreshing || !text;
  const unavailable = connection.error && denied(connection.error) || !connection.isLoading && !connection.error && !eligible;
  return <KeyboardAvoidingView style={chat.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SafeAreaView style={chat.screen} edges={['top', 'left', 'right']}>
      <View style={chat.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={chat.back}>
          <Ionicons name="chevron-back" size={25} color={colors.textPrimary} />
        </Pressable>
        <ProfilePortrait profile={person} accessibilityLabel={`${name}'s profile photo`} style={chat.avatar}
          fallback={<View style={[chat.avatar, chat.initial]}><Text style={chat.initialText}>{name.charAt(0)}</Text></View>} />
        <View style={chat.identity}><Text style={chat.name} numberOfLines={2}>{connection.isLoading ? 'Conversation' : name}</Text>
          {eligible ? <Text style={chat.subtitle}>Connected on Lérí</Text> : null}</View>
      </View>
      {connection.isLoading ? <View style={chat.state}><LoadingState /></View>
        : connection.error ? <View style={chat.state}>{unavailable
          ? <ContentStateView state={{ kind: 'unavailable', message: 'This conversation is unavailable to your account.' }} />
          : <ErrorState error={connection.error} onRetry={connection.reload} />}</View>
          : unavailable ? <View style={chat.state}><ContentStateView state={{ kind: 'unavailable', message: 'Messages are available only to participants in an accepted connection.' }} /></View>
            : <FlatList<Message> ref={list} style={chat.history} contentContainerStyle={chat.messages}
              data={blocked ? [] : messages} keyExtractor={message => message.id}
              keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}
              onRefresh={sending ? undefined : () => void refresh()} refreshing={connection.isRefreshing || history.isRefreshing}
              onScroll={({ nativeEvent: event }) => { nearBottom.current = event.contentSize.height - event.layoutMeasurement.height - event.contentOffset.y < 80; }} scrollEventThrottle={100}
              onContentSizeChange={followLatest} onLayout={followLatest}
              ListHeaderComponent={<View>
                {history.isLoading ? <LoadingState /> : history.error ? <ErrorState error={history.error} onRetry={refresh} /> : null}
                {!history.isLoading && !history.error && history.data && !messages.length ? <View style={chat.empty}>
                  <Ionicons name="chatbubble-outline" size={28} color={colors.textSecondary} />
                  <Text style={chat.emptyTitle}>Say hello</Text><Text style={chat.emptyText}>Start a conversation with {name}.</Text>
                </View> : null}
                {blocked ? <ContentStateView state={{ kind: 'unavailable', message: 'Messaging access is unavailable. Pull down to check your connection.' }} /> : null}
              </View>}
              ListFooterComponent={<View>
                {history.moreError ? <ErrorState error={history.moreError} onRetry={history.loadMore} /> : null}
                {history.data?.nextCursor ? <Button label="More messages" variant="secondary" loading={history.isLoadingMore} disabled={sending || history.isRefreshing || blocked} onPress={() => void history.loadMore()} /> : null}
              </View>}
              renderItem={({ item: message, index }) => {
                const mine = message.senderId === user?.id;
                const previous = messages[index - 1];
                const date = new Date(message.sentAt);
                const newDay = !previous || new Date(previous.sentAt).toDateString() !== date.toDateString();
                const grouped = previous && !newDay && previous.senderId === message.senderId && date.getTime() - new Date(previous.sentAt).getTime() < 5 * 60 * 1000;
                return <View>
                  {newDay ? <Text style={chat.day}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text> : null}
                  <View style={[chat.bubble, mine ? chat.sent : chat.received, { marginTop: grouped ? 3 : 12 }]}>
                    <Text selectable style={[chat.message, mine && chat.sentText]}>{message.text}</Text>
                    <Text style={[chat.time, mine && chat.sentTime]} accessibilityLabel={date.toLocaleString()}>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>;
              }} />}
      {eligible ? <View style={[chat.composerArea, { paddingBottom: keyboardOpen ? 10 : Math.max(insets.bottom, 12) }]}>
        {error ? <View style={chat.error}><Text accessibilityRole="alert" style={chat.errorText}>{error.message}</Text>
          <Text style={chat.errorText}>Draft kept. Pull down to refresh before retrying if delivery is uncertain.</Text></View> : null}
        <View style={chat.composer}>
          <TextInput accessibilityLabel="Message" placeholder="Write a message…" placeholderTextColor={colors.textMuted}
            multiline value={draft} maxLength={4000} editable={!sending && !blocked}
            onChangeText={value => { setDraft(value); setSendConfirmed(false); }} style={chat.input} />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled, busy: sending }}
            disabled={disabled} onPress={() => void send()} style={({ pressed }) => [chat.send, disabled && chat.sendDisabled, pressed && !disabled && { backgroundColor: colors.accentPressed }]}>
            {sending ? <ActivityIndicator size="small" color={colors.onAccent} /> : <Ionicons name="arrow-up" size={24} color={disabled ? colors.textSecondary : colors.onAccent} />}
          </Pressable>
        </View>
        {sendConfirmed ? <Text accessibilityLiveRegion="polite" style={chat.confirmed}>Message sent</Text> : null}
      </View> : null}
    </SafeAreaView>
  </KeyboardAvoidingView>;
}

const chat = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  initial: { backgroundColor: colors.accentMuted, alignItems: 'center', justifyContent: 'center' },
  initialText: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  identity: { flex: 1, paddingRight: 12, gap: 3 },
  name: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 12 },
  history: { flex: 1 },
  messages: { flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  state: { flex: 1, padding: 20 },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  day: { textAlign: 'center', color: colors.textSecondary, fontSize: 12, marginTop: 16, marginBottom: 4 },
  bubble: { maxWidth: '84%', minWidth: 68, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 8, borderRadius: 19 },
  received: { alignSelf: 'flex-start', backgroundColor: colors.surfaceSage, borderBottomLeftRadius: 6 },
  sent: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderBottomRightRadius: 6 },
  message: { color: colors.textPrimary, fontSize: 16, lineHeight: 23, flexShrink: 1 },
  sentText: { color: colors.onAccent },
  time: { color: colors.textSecondary, fontSize: 11, alignSelf: 'flex-end', marginTop: 5 },
  sentTime: { color: '#E2EDDF' },
  composerArea: { backgroundColor: colors.background, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10, paddingHorizontal: 12 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  sendDisabled: { backgroundColor: colors.accentMuted },
  error: { paddingBottom: 10, gap: 4 },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  confirmed: { color: colors.textSecondary, fontSize: 11, paddingTop: 4, paddingLeft: 16 },
});
