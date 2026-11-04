// Component-level failure/state checks; these are not simulator or live API evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const settle = () => new Promise(resolve => setImmediate(resolve));
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
function transpile(file) { return ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
  fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText; }
const profileExports = {};
vm.runInNewContext(transpile('../src/lib/profiles.ts'), { exports: profileExports, URL, Date });
function harness() {
  const slots = []; let index = 0, calls = 0;
  const connection = { data: { id: 'connection', conversationId: 'connection', senderId: 'renter', recipientId: 'landlord', status: 'accepted',
    counterparty: { displayName: 'Synthetic landlord' } }, error: null, isLoading: false, isRefreshing: false, refresh: async () => {}, reload: async () => {} };
  const history = { data: { items: [], nextCursor: null }, error: null, moreError: null, isLoading: false, isRefreshing: false, isLoadingMore: false, refresh: async () => {}, loadMore: async () => {} };
  let send = async () => { throw new Error('Offline'); };
  const jsx = (type, props) => typeof type === 'function' ? type(props) : { type, props };
  const react = { useState(initial) { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
    return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = index++; slots[i] ??= { current: initial }; return slots[i]; }, useEffect() {} };
  const exports = {};
  vm.runInNewContext(transpile('../src/screens/connections/ConversationScreen.tsx'), { exports, Error, Date, requestAnimationFrame: fn => fn(), require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (name === 'react-native') return { View: 'View', Text: 'Text', Image: 'Image', TextInput: 'TextInput', Pressable: 'Pressable', FlatList: 'FlatList',
      KeyboardAvoidingView: 'KeyboardAvoidingView', ActivityIndicator: 'ActivityIndicator', Platform: { OS: 'ios' }, Keyboard: {}, StyleSheet: { create: value => value, hairlineWidth: 1 } };
    if (name === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ bottom: 34 }) };
    if (name.endsWith('/AuthProvider')) return { useAuth: () => ({ user: { id: 'renter' } }) };
    if (name.endsWith('/useApiQuery')) return { useApiQuery: key => key.startsWith('chat-connection/') ? connection : history };
    if (name.endsWith('/profiles')) return profileExports;
    if (name.endsWith('/api')) return { ApiError, api: { sendMessage: async (...args) => { calls++; return send(...args); } } };
    if (name.endsWith('/colors')) return { colors: {} };
    return { Ionicons: 'Icon', Button: 'Button', LoadingState: 'LoadingState', ErrorState: 'ErrorState', ContentStateView: 'ContentStateView' };
  } });
  return { connection, history, calls: () => calls, send: fn => { send = fn; }, render() { index = 0; return exports.ConversationScreen({ route: { params: { connectionId: 'connection' } }, navigation: { goBack() {} } }); } };
}
function nodes(tree, predicate) {
  if (tree == null) return [];
  if (Array.isArray(tree)) return tree.flatMap(value => nodes(value, predicate));
  if (typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const input = tree => nodes(tree, node => node.type === 'TextInput')[0];
const sendButton = tree => nodes(tree, node => node.props?.accessibilityLabel === 'Send message')[0];
const list = tree => nodes(tree, node => node.type === 'FlatList')[0];
const text = tree => tree == null ? '' : Array.isArray(tree) ? tree.map(text).join(' ') : typeof tree === 'object' ? text(tree.props?.children) : String(tree);
test('conversation serializes sends, retains failed drafts, and renders only confirmed saved messages', async () => {
  const h = harness(); let reject;
  h.send(() => new Promise((_, fail) => { reject = fail; }));
  input(h.render()).props.onChangeText('Buffered introduction');
  let tree = h.render(); sendButton(tree).props.onPress(); sendButton(tree).props.onPress();
  assert.equal(h.calls(), 1);
  tree = h.render(); assert.equal(sendButton(tree).props.disabled, true); assert.equal(input(tree).props.editable, false);
  assert.equal(list(tree).props.data.length, 0);
  reject(new Error('Offline')); await settle(); tree = h.render();
  assert.equal(input(tree).props.value, 'Buffered introduction'); assert.match(text(tree), /Draft kept/); assert.doesNotMatch(text(tree), /Message sent/);
  const saved = { id: 'saved', connectionId: 'connection', senderId: 'renter', text: 'Buffered introduction', cursor: '1', sentAt: '2026-10-25T12:00:00Z' };
  h.send(async () => saved); sendButton(tree).props.onPress(); await settle(); tree = h.render();
  assert.equal(input(tree).props.value, ''); assert.match(text(tree), /Message sent/); assert.equal(list(tree).props.data[0].id, saved.id);
  h.history.data.items = [saved]; assert.equal(list(h.render()).props.data.length, 1, 'Refresh must not duplicate a locally confirmed message');
});
test('pending/nonparticipant conversations have no composer; denied history hides content and blocks sending', () => {
  for (const update of [{ status: 'pending', conversationId: null }, { recipientId: 'someone-else', senderId: 'another-person' }, { conversationId: 'wrong' }]) {
    const h = harness(); Object.assign(h.connection.data, update); assert.equal(input(h.render()), undefined); assert.equal(h.calls(), 0);
  }
  const h = harness(); h.history.data.items = [{ id: 'private', cursor: '1', connectionId: 'connection', senderId: 'landlord', text: 'Hidden after denial' }];
  h.history.error = new ApiError(403, 'Access denied'); const tree = h.render();
  assert.equal(list(tree).props.data.length, 0); assert.equal(input(tree).props.editable, false); assert.equal(sendButton(tree).props.disabled, true);
});
test('history loading/errors/refresh block sends and chronological bubbles retain correct alignment', () => {
  for (const update of [{ isLoading: true }, { error: new Error('History unavailable') }, { isRefreshing: true }]) {
    const h = harness(); input(h.render()).props.onChangeText('Draft'); Object.assign(h.history, update); assert.equal(sendButton(h.render()).props.disabled, true);
  }
  const h = harness(); h.history.data.items = [
    { id: 'received', connectionId: 'connection', senderId: 'landlord', text: 'Hello renter', cursor: '2', sentAt: '2026-10-25T12:01:00Z' },
    { id: 'sent', connectionId: 'connection', senderId: 'renter', text: 'Hello landlord', cursor: '1', sentAt: '2026-10-25T12:00:00Z' },
  ];
  const messages = list(h.render()); assert.deepEqual(Array.from(messages.props.data, message => message.id), ['sent', 'received']);
  const sent = messages.props.renderItem({ item: messages.props.data[0], index: 0 });
  const received = messages.props.renderItem({ item: messages.props.data[1], index: 1 });
  const alignments = tree => nodes(tree, node => Array.isArray(node.props?.style)).flatMap(node => node.props.style.filter(Boolean).map(style => style.alignSelf)).filter(Boolean);
  assert.ok(alignments(sent).includes('flex-end')); assert.ok(alignments(received).includes('flex-start'));
  assert.doesNotMatch(text(h.render()), /read receipt|delivered|online now|real.time/i);
});
