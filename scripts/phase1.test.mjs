// Isolated contract/validation tests. Synthetic fixtures never enter the app UI
// or call a live backend; successful persistence must still come from the server.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function loadSource(relative, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { exports, URL, URLSearchParams, Date, ...globals });
  return exports;
}
const { profileDraft, profilePatch, profileSummary } = loadSource('../src/lib/profiles.ts');
const renter = {
  kind: 'renter', id: 'test-only', displayName: 'Test account', bio: null, photoUrl: null,
  personalStory: null, currentLocation: 'Private location', preferredLocation: null,
  budgetMin: 500, budgetMax: 1000, targetMoveDate: null, tenancyLengthMonths: 12,
  householdSize: 1, householdType: 'single', householdPreferences: [], discoverable: false,
  verification: { identityStatus: 'unverified', photoStatus: 'unverified', mode: 'real' },
  memberSince: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
};
const plain = value => JSON.parse(JSON.stringify(value));

test('profile patches contain only changed, editable role fields', () => {
  assert.deepEqual(plain(profilePatch(renter, profileDraft(renter))), {});
  const draft = { ...profileDraft(renter), bio: 'New bio', verification: 'verified', role: 'landlord', registrationNumbers: 'not-renter-data' };
  assert.deepEqual(plain(profilePatch(renter, draft)), { bio: 'New bio' });
});
test('nullable clears, zero budget and partial-range validation follow the contract', () => {
  assert.deepEqual(plain(profilePatch(renter, { ...profileDraft(renter), budgetMin: '0', currentLocation: '' })), { currentLocation: null, budgetMin: 0 });
  assert.throws(() => profilePatch(renter, { ...profileDraft(renter), budgetMin: '1001' }), /Minimum budget/);
  assert.throws(() => profilePatch(renter, { ...profileDraft(renter), budgetMax: '0.001' }), /two decimals/);
  assert.throws(() => profilePatch(renter, { ...profileDraft(renter), householdSize: '31' }), /1 to 30/);
  assert.throws(() => profilePatch(renter, { ...profileDraft(renter), tenancyLengthMonths: '1.5' }), /whole number/);
});
test('dates, required names and public portrait URLs are validated without accepting local files', () => {
  for (const date of ['2026-02-30', '2026-13-01', '01/11/2026']) assert.throws(() => profilePatch(renter, { ...profileDraft(renter), targetMoveDate: date }), /calendar date/);
  assert.equal(profilePatch(renter, { ...profileDraft(renter), targetMoveDate: '2028-02-29' }).targetMoveDate, '2028-02-29');
  assert.throws(() => profilePatch(renter, { ...profileDraft(renter), displayName: ' ' }), /required/);
  for (const url of ['file:///private/photo.jpg', 'http://example.test/a.jpg', 'https://user:password@example.test/a.jpg']) assert.throws(() => profilePatch(renter, { ...profileDraft(renter), photoUrl: url }), /HTTPS/);
});
test('landlord arrays are deduplicated and no renter or verification fields are sent', () => {
  const landlord = { ...renter, kind: 'landlord', companyName: null, landlordType: null, lettingExperienceYears: 0,
    numberOfProperties: 0, locationsCovered: [], communicationStyle: null, lettingApproach: null,
    tenantExpectations: null, tenancySuccess: null, registrationNumbers: [], registrationDetails: null };
  const draft = { ...profileDraft(landlord), registrationNumbers: ' test-one\ntest-one\n test-two ', locationsCovered: 'Edinburgh', personalStory: 'wrong-role' };
  assert.deepEqual(plain(profilePatch(landlord, draft)), { locationsCovered: ['Edinburgh'], registrationNumbers: ['test-one', 'test-two'] });
  assert.throws(() => profilePatch(landlord, { ...profileDraft(landlord), lettingExperienceYears: '101' }), /0 to 100/);
});

function clientHarness() {
  const requests = []; let authReads = 0; let signOuts = 0; let status = 200;
  const supabase = { auth: { getSession: async () => { authReads++; return { data: { session: { access_token: 'test-token' } } }; }, signOut: async () => { signOuts++; } } };
  const module = loadSource('../src/lib/api.ts', {
    process: { env: { EXPO_PUBLIC_API_URL: 'https://api.test' } },
    require: name => { assert.equal(name, './supabase'); return { supabase }; },
    fetch: async (url, options) => {
      requests.push({ path: new URL(url).pathname, search: new URL(url).search, ...options, body: options.body ? JSON.parse(options.body) : undefined });
      return new Response(JSON.stringify(status === 200 ? {} : { message: ['Contract error'] }), { status });
    },
  });
  return { ...module, requests, authReads: () => authReads, signOuts: () => signOuts, setStatus: value => { status = value; } };
}
test('Phase 1 routes use documented methods, bodies and authentication', async () => {
  const h = clientHarness(); const a = h.api;
  await a.getOwnProfile(); await a.updateOwnProfile({ personalStory: null }); await a.getProfilePreview();
  await a.getPublicProfile('00000000-0000-4000-8000-000000000001'); await a.evidenceCatalogue();
  await a.legalDocuments(); await a.getPrivacy(); await a.acceptTerms('v1'); await a.acknowledgeNotice('v1');
  await a.setConsent('user_research', false, 'v1');
  assert.deepEqual(h.requests.map(r => [r.method, r.path]), [
    ['GET', '/me/profile'], ['PATCH', '/me/profile'], ['GET', '/me/profile/preview'],
    ['GET', '/profiles/00000000-0000-4000-8000-000000000001'], ['GET', '/evidence/catalogue'],
    ['GET', '/legal/documents'], ['GET', '/me/privacy'], ['POST', '/me/privacy/terms-acceptance'],
    ['POST', '/me/privacy/notice-acknowledgement'], ['PUT', '/me/privacy/consents'],
  ]);
  assert.deepEqual(h.requests[1].body, { personalStory: null });
  assert.deepEqual(h.requests[7].body, { termsVersion: 'v1', accepted: true });
  assert.deepEqual(h.requests[8].body, { privacyNoticeVersion: 'v1', acknowledged: true });
  assert.deepEqual(h.requests[9].body, { purpose: 'user_research', granted: false, privacyNoticeVersion: 'v1' });
  assert.equal(h.authReads(), 9); assert.equal(h.requests[5].headers.Authorization, undefined);
  assert.equal(h.requests[0].headers.Authorization, 'Bearer test-token');
});
test('failed writes reject; version conflicts retain status; only authenticated 401 signs out', async () => {
  const h = clientHarness(); h.setStatus(409);
  await assert.rejects(h.api.acceptTerms('old'), e => e instanceof h.ApiError && e.status === 409);
  h.setStatus(400); await assert.rejects(h.api.updateOwnProfile({ bio: 'edit' }), e => e.status === 400);
  h.setStatus(503); await assert.rejects(h.api.legalDocuments(), e => e.status === 503);
  h.setStatus(401); await assert.rejects(h.api.legalDocuments()); assert.equal(h.signOuts(), 0);
  await assert.rejects(h.api.getOwnProfile()); assert.equal(h.signOuts(), 1);
});


test('display cleanup hides validation markers without mutating stored data or form patches', () => {
  const id = '12345678-1234-1234-1234-123456789abc';
  const source = { ...renter, bio: `Synthetic Phase 1 connectivity test ${id}`, personalStory: `Synthetic renter: I care for shared spaces. Test ${id}` };
  assert.equal(profileSummary(source.bio), '');
  assert.equal(profileSummary(source.personalStory), 'I care for shared spaces.');
  assert.equal(profileSummary('I work in software implementation and enjoy testing recipes.'), 'I work in software implementation and enjoy testing recipes.');
  assert.equal(profileDraft(source).bio, source.bio);
  assert.deepEqual(plain(profilePatch(source, profileDraft(source))), {});
});

test('Phase A client uses documented discovery, nested property and photo routes', async () => {
  const h = clientHarness();
  await h.api.discover('suggested');
  await h.api.discover('all', 'cursor-test');
  await h.api.getPublicLandlordProperties('landlord-test');
  await h.api.getPublicLandlordProperty('landlord-test', 'property-test');
  await h.api.getPublicPropertyPhoto('landlord-test', 'property-test', 'photo-test');
  assert.deepEqual(h.requests.map(r => r.path), ['/discovery', '/discovery', '/landlords/landlord-test/properties', '/landlords/landlord-test/properties/property-test', '/landlords/landlord-test/properties/property-test/photos/photo-test/download']);
  assert.ok(h.requests.every(r => r.method === 'GET' && r.headers.Authorization === 'Bearer test-token' && r.body === undefined));
  assert.equal(h.authReads(), 5);
  assert.equal(h.requests[0].search, '?mode=suggested&limit=20');
  assert.equal(h.requests[1].search, '?mode=all&limit=20&after=cursor-test');
});

const { mergeDiscoveryPages } = loadSource('../src/lib/profiles.ts');
const page = (ids, nextCursor = null) => ({ items: ids.map(id => ({ profile: { id }, reasons: [] })), nextCursor });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = () => new Promise(resolve => setImmediate(resolve));
function queryHarness() {
  const slots = []; let index = 0, focus, cleanup, pendingEffect;
  const react = {
    useRef(value) { const i = index++; slots[i] ??= { current: value }; return slots[i]; },
    useState(value) { const i = index++; if (!(i in slots)) slots[i] = value; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
    useCallback(fn, deps) { const i = index++; if (!slots[i] || deps.some((d, n) => d !== slots[i].deps[n])) slots[i] = { fn, deps }; return slots[i].fn; },
  };
  const { useApiQuery } = loadSource('../src/lib/useApiQuery.ts', { Error, require(name) {
    if (name === 'react') return react;
    assert.equal(name, '@react-navigation/native');
    return { useFocusEffect(callback) { if (callback !== focus) { focus = callback; pendingEffect = callback; } } };
  } });
  return { render(key, fetcher, pagination) { index = 0; const result = useApiQuery(key, fetcher, pagination); if (pendingEffect) { cleanup?.(); cleanup = pendingEffect(); pendingEffect = null; } return result; }, blur() { cleanup?.(); } };
}
test('discovery pagination continues empty candidate pages and deduplicates identities', async () => {
  const h = queryHarness(); const first = async () => page([], 'candidate-1'); let calls = 0;
  const options = { cursor: p => p.nextCursor, fetchNext: async () => { calls++; return calls === 1 ? page(['person-1'], 'candidate-2') : page(['person-1', 'person-2']); }, merge: mergeDiscoveryPages };
  assert.equal(h.render('suggested', first, options).isLoading, true); await settle();
  let q = h.render('suggested', first, options); assert.equal(q.data.nextCursor, 'candidate-1');
  await q.loadMore(); q = h.render('suggested', first, options); await q.loadMore(); q = h.render('suggested', first, options);
  assert.deepEqual(plain(q.data.items.map(x => x.profile.id)), ['person-1', 'person-2']);
  assert.equal(q.data.nextCursor, null); await q.loadMore(); assert.equal(calls, 2);
});
test('pagination rejects duplicate loads, keeps errors honest and drops stale mode responses', async () => {
  const h = queryHarness(); const first = async () => page(['person-1'], 'candidate-1'); const next = deferred(); let calls = 0;
  const options = { cursor: p => p.nextCursor, fetchNext: () => { calls++; return next.promise; }, merge: mergeDiscoveryPages };
  h.render('suggested', first, options); await settle();
  let q = h.render('suggested', first, options); const loading = q.loadMore(); await q.loadMore(); assert.equal(calls, 1);
  const all = async () => page(['explore-person']); assert.equal(h.render('all', all, options).data, undefined); await settle();
  next.resolve(page(['stale-person'])); await loading;
  q = h.render('all', all, options); assert.deepEqual(plain(q.data.items.map(x => x.profile.id)), ['explore-person']);
  const failure = { ...options, fetchNext: async () => { throw new Error('Page failed'); } };
  h.render('suggested-again', first, failure); await settle(); q = h.render('suggested-again', first, failure); await q.loadMore();
  q = h.render('suggested-again', first, failure); assert.equal(q.moreError.message, 'Page failed'); assert.equal(q.data.items.length, 1);
  await q.refresh(); q = h.render('suggested-again', first, failure); assert.equal(q.moreError, null);
});
test('refresh invalidates a pending page and blur invalidates initial reads', async () => {
  const h = queryHarness(); let reads = 0; const first = async () => page([`read-${++reads}`], 'candidate'); const next = deferred();
  const options = { cursor: p => p.nextCursor, fetchNext: () => next.promise, merge: mergeDiscoveryPages };
  h.render('same', first, options); await settle(); let q = h.render('same', first, options);
  const loading = q.loadMore(); await q.refresh(); next.resolve(page(['stale-page'])); await loading;
  q = h.render('same', first, options); assert.deepEqual(plain(q.data.items.map(x => x.profile.id)), ['read-2']);
  const late = deferred(); h.render('late', () => late.promise); h.blur(); late.resolve(page(['hidden-response'])); await settle();
  assert.equal(h.render('late', () => late.promise).data, undefined);
});


test('Phase B uses exact person request payloads, filtered pages and explicit recipient actions', async () => {
  const h = clientHarness();
  await h.api.createConnection({ recipientId: 'recipient', introduction: 'A personal introduction' });
  await h.api.listConnections({ direction: 'incoming' }, 'cursor');
  await h.api.listConnections({ direction: 'outgoing' });
  await h.api.listConnections({ status: 'accepted' });
  await h.api.getConnection('connection');
  for (const action of ['accept', 'decline', 'review-later']) await h.api.decideConnection('connection', action);
  assert.deepEqual(h.requests[0].body, { recipientId: 'recipient', introduction: 'A personal introduction' });
  assert.equal(h.requests[1].search, '?limit=20&direction=incoming&after=cursor');
  assert.equal(h.requests[2].search, '?limit=20&direction=outgoing');
  assert.equal(h.requests[3].search, '?limit=20&status=accepted');
  assert.deepEqual(h.requests.slice(4).map(row => [row.method, row.path, row.body]), [['GET', '/connections/connection', undefined], ['POST', '/connections/connection/accept', undefined], ['POST', '/connections/connection/decline', undefined], ['POST', '/connections/connection/review-later', undefined]]);
  assert.ok(h.requests.every(row => row.headers.Authorization === 'Bearer test-token'));
});
const { canDecideConnection, connectionIntroduction, connectionFilter, mergeConnectionPages } = loadSource('../src/lib/profiles.ts');
test('only the true recipient can decide outstanding person requests', () => {
  const request = { id: 'c', senderId: 'sender', recipientId: 'recipient', direction: 'incoming', status: 'pending' };
  assert.equal(canDecideConnection(request, 'recipient'), true);
  for (const user of ['sender', 'outsider', undefined]) assert.equal(canDecideConnection(request, user), false);
  for (const status of ['accepted', 'declined']) assert.equal(canDecideConnection({ ...request, status }, 'recipient'), false);
  assert.equal(canDecideConnection({ ...request, status: 'review_later' }, 'recipient'), true);
  assert.equal(canDecideConnection({ ...request, direction: 'outgoing' }, 'recipient'), false);
  assert.equal(canDecideConnection({ ...request, senderId: 'recipient' }, 'recipient'), false);
});
test('notes remain person introductions and include optional mentions within the server limit', () => {
  assert.equal(connectionIntroduction(' Hello ', ' Edinburgh flat '), 'Hello\n\nProperty mention: Edinburgh flat');
  assert.equal(connectionIntroduction('Hello', '  '), 'Hello');
  assert.throws(() => connectionIntroduction(' ', 'Only a property'), /personalised/);
  assert.equal(connectionIntroduction('a'.repeat(3000), '').length, 3000);
  assert.throws(() => connectionIntroduction('a'.repeat(3000), 'Property'), /3,000/);
});
test('direction lists retain all states and accepted lists use the server status filter', () => {
  assert.deepEqual(plain(connectionFilter('Incoming')), { direction: 'incoming' });
  assert.deepEqual(plain(connectionFilter('Outgoing')), { direction: 'outgoing' });
  assert.deepEqual(plain(connectionFilter('Accepted')), { status: 'accepted' });
  const result = mergeConnectionPages({ items: [{ id: 'a', status: 'pending' }], nextCursor: 'first' }, { items: [{ id: 'a', status: 'review_later' }, { id: 'b', status: 'declined' }], nextCursor: null });
  assert.deepEqual(plain(result), { items: [{ id: 'a', status: 'review_later' }, { id: 'b', status: 'declined' }], nextCursor: null });
});
test('Phase B failures reject without manufacturing sent or accepted responses', async () => {
  for (const status of [400, 403, 404, 409]) {
    const h = clientHarness(); h.setStatus(status);
    await assert.rejects(h.api.createConnection({ recipientId: 'recipient', introduction: 'Hello' }), error => error.status === status);
    await assert.rejects(h.api.decideConnection('c', 'accept'), error => error.status === status);
  }
});

const { canMessageConnection, mergeMessagePages } = loadSource('../src/lib/profiles.ts');
test('messaging admits only accepted participants with the confirmed conversation identity', () => {
  const connection = { id: 'c', conversationId: 'c', senderId: 'a', recipientId: 'b', status: 'accepted' };
  for (const user of ['a', 'b']) assert.equal(canMessageConnection(connection, user), true);
  for (const user of ['outsider', undefined]) assert.equal(canMessageConnection(connection, user), false);
  for (const status of ['pending', 'review_later', 'declined']) assert.equal(canMessageConnection({ ...connection, status }, 'a'), false);
  for (const conversationId of [null, 'other']) assert.equal(canMessageConnection({ ...connection, conversationId }, 'a'), false);
});
test('message pagination deduplicates and preserves 18-digit cursors without numeric rounding', () => {
  const message = (id, cursor) => ({ id, cursor });
  const page = mergeMessagePages({ items: [message('b', '999999999999999998'), message('a', '9')], nextCursor: '9' },
    { items: [message('c', '999999999999999999'), message('b', '999999999999999998')], nextCursor: null });
  assert.deepEqual(plain(page.items.map(m => m.id)), ['a', 'b', 'c']);
  assert.equal(page.items[2].cursor, '999999999999999999'); assert.equal(page.nextCursor, null);
});
test('Phase C transport follows exact message routes, cursor query and plain text payload', async () => {
  const h = clientHarness();
  await h.api.listMessages('connection'); await h.api.listMessages('connection', '999999999999999998');
  await h.api.sendMessage('connection', 'Hello');
  assert.deepEqual(h.requests.map(r => [r.method, r.path, r.search, r.body]), [
    ['GET', '/connections/connection/messages', '?limit=50', undefined],
    ['GET', '/connections/connection/messages', '?limit=50&after=999999999999999998', undefined],
    ['POST', '/connections/connection/messages', '', { text: 'Hello' }],
  ]);
  for (const status of [403, 404, 409, 500]) { h.setStatus(status); await assert.rejects(h.api.sendMessage('connection', 'Kept draft'), e => e.status === status); }
});
