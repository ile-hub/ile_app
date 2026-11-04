// Opt-in, append-only live verification. Never reset, migrate, delete or target a remote service.
// Requires the separately verified disposable stack and test API (see Phase D report).
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const config = JSON.parse(readFileSync(process.env.LERI_PHASE_D_CONFIG ?? '/tmp/leri-phase-d-public-config.json', 'utf8'));
assert.equal(config.api, 'http://localhost:3001');
assert.equal(config.supabase, 'http://localhost:55321');
assert.equal(config.project, 'leri-phase2-validation-20261014-final');
assert.equal(JSON.parse(Buffer.from(config.anon.split('.')[1], 'base64url').toString()).role, 'anon');
const run = `phase-d-${Date.now()}`;
const results = [], accounts = {};
let active = null;
const exports = {};
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/api.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
vm.runInNewContext(compiled, { exports, URL, URLSearchParams, process: { env: { EXPO_PUBLIC_API_URL: config.api } }, fetch,
  require: name => { assert.equal(name, './supabase'); return { supabase: { auth: {
    getSession: async () => ({ data: { session: active ? { access_token: active.token } : null } }),
    signOut: async () => { active = null; },
  } } }; },
});
const api = exports.api;
async function raw(who, path, method = 'GET', body) {
  const response = await fetch(config.api + path, { method, headers: {
    Accept: 'application/json', ...(who ? { Authorization: `Bearer ${who.token}` } : {}),
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text(); let value; try { value = JSON.parse(text); } catch { value = text; }
  return { status: response.status, value };
}
async function check(name, fn) {
  try { const detail = await fn(); results.push({ name, status: 'PASS', detail: detail ?? 'Assertions passed' }); console.log(`PASS ${name}`); }
  catch (error) { const status = error.blocked ? 'BLOCKED' : 'FAIL'; results.push({ name, status, detail: error.message }); console.log(`${status} ${name}: ${error.message}`); }
}
function blocked(message) { const error = new Error(message); error.blocked = true; throw error; }
async function create(label, role, discoverable = true) {
  const email = `${run}-${label}@example.test`, password = `D!${randomBytes(20).toString('hex')}`;
  const response = await fetch(`${config.supabase}/auth/v1/signup`, { method: 'POST', headers: { apikey: config.anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, data: { role, display_name: `D ${label} ${run.slice(-4)}` } }) });
  const body = await response.json();
  assert.equal(response.status, 200, `Public signup failed (${response.status})`);
  if (!body.access_token) blocked('Public signup requires email confirmation; no admin bypass performed.');
  const account = { email, password, role, id: body.user.id, token: body.access_token };
  accounts[label] = account; active = account;
  const own = await api.updateOwnProfile({ discoverable, bio: `Synthetic ${run}: ${label}; clear communication and care for shared spaces.` });
  assert.equal(own.id, account.id);
  return account;
}
const privateKeys = new Set(['registrationNumbers', 'registrationDetails', 'currentLocation', 'privateReference', 'addressLine1', 'postcode', 'hmoLicenceDetails', 'explanation', 'objectPath', 'object_path', 'storagePath', 'documentId']);
function publicOnly(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) { assert.ok(!privateKeys.has(key), `Public response leaked ${key}`); publicOnly(child); }
}
async function allDiscovery(mode) {
  let cursor; const items = []; const seen = new Set();
  for (let i = 0; i < 50; i++) {
    const page = await api.discover(mode, cursor); items.push(...page.items);
    if (!page.nextCursor) return items;
    assert.ok(!seen.has(page.nextCursor), 'Discovery cursor repeated'); seen.add(page.nextCursor); cursor = page.nextCursor;
  }
  blocked('Discovery exceeds 50 pages; did not claim full traversal.');
}
let r, l, later, decline, outsider, hidden, acceptedId, reverseId, fixture;
await check('Isolated API health and unauthenticated access', async () => {
  const health = await raw(null, '/health'); assert.equal(health.status, 200); assert.equal(health.value.db, 'ok');
  assert.equal((await raw(null, '/me')).status, 401);
});
await check('Create synthetic accounts through public signup and verify server roles', async () => {
  r = await create('renter', 'renter'); l = await create('landlord', 'landlord');
  later = await create('api-landlord', 'landlord'); decline = await create('decline-landlord', 'landlord');
  outsider = await create('outside-renter', 'renter'); hidden = await create('hidden-renter', 'renter', false);
  for (const account of [r, l, later, decline, outsider, hidden]) { active = account; const me = await api.getMe(); assert.equal(me.role, account.role); }
  writeFileSync('/tmp/leri-phase-d-accounts.json', JSON.stringify({ run, accounts }), { mode: 0o600 });
  return 'Six new isolated synthetic accounts; credentials stored only in a private temporary file.';
});
if (r && l && later && decline && outsider && hidden) {
  await check('Profile save, reload and saved public previews for both roles', async () => {
    for (const account of [r, l]) {
      active = account;
      const fields = account.role === 'renter' ? { personalStory: 'I communicate early and care for shared spaces.', currentLocation: `PRIVATE-${run}` }
        : { companyName: 'Synthetic Phase D Lettings', registrationNumbers: [`PRIVATE-${run}`], registrationDetails: `PRIVATE-${run}`, communicationStyle: 'Clear and considerate.' };
      const bio = `Saved Phase D ${account.role} profile`;
      const saved = await api.updateOwnProfile({ bio, ...fields }); assert.equal(saved.bio, bio);
      const loaded = await api.getOwnProfile(); assert.equal(loaded.bio, bio);
      const preview = await api.getProfilePreview(); assert.equal(preview.bio, bio); publicOnly(preview);
      assert.ok(!JSON.stringify(preview).includes(`PRIVATE-${run}`));
      assert.equal(preview.verification.identityStatus, loaded.verification.identityStatus); assert.equal(preview.verification.photoStatus, loaded.verification.photoStatus);
      if (account.role === 'landlord') assert.equal(preview.verification.registrationStatus, loaded.verification.registrationStatus);
      assert.notEqual(preview.verification.identityStatus, 'verified');
    }
  });
  await check('Explore: opposite-role discoverable profiles only, no private fields or numeric scores', async () => {
    active = r; const landlords = await allDiscovery('all');
    assert.ok(landlords.some(item => item.profile.id === l.id));
    for (const item of landlords) { assert.equal(item.profile.kind, 'landlord'); publicOnly(item); assert.ok(!/(trustScore|riskScore|matchScore|compatibilityScore)"/.test(JSON.stringify(item))); }
    active = l; const renters = await allDiscovery('all');
    assert.ok(renters.some(item => item.profile.id === r.id)); assert.ok(!renters.some(item => item.profile.id === hidden.id));
    for (const item of renters) { assert.equal(item.profile.kind, 'renter'); publicOnly(item); }
    const candidates = landlords.filter(item => item.profile.properties?.length).map(item => item.profile);
    fixture = candidates.find(profile => profile.properties.some(property => property.photos?.length)) ?? candidates[0];
    return `${landlords.length} landlord candidates and ${renters.length} renter candidates inspected; unverified new accounts are eligible.`;
  });
  await check('Published properties and photos use safe public projections and signed access', async () => {
    if (!fixture) blocked('No existing published-property fixture available; no property created outside authorised account/request/message scope.');
    active = r; const properties = await api.getPublicLandlordProperties(fixture.id); assert.ok(properties.length);
    for (const property of properties) { publicOnly(property); assert.equal(property.status, 'published'); assert.equal(property.listingStatus, 'available'); }
    const withPhoto = properties.find(property => property.photos.length);
    fixture = { ...fixture, checkedProperty: properties[0] };
    if (!withPhoto) blocked('Existing published fixtures have no active photos.');
    const detail = await api.getPublicLandlordProperty(fixture.id, withPhoto.id); publicOnly(detail);
    const photo = await api.getPublicPropertyPhoto(fixture.id, withPhoto.id, detail.photos[0].id);
    assert.equal(photo.expiresIn, 60); assert.ok((await fetch(photo.url)).ok);
    const bad = await raw(r, `/landlords/${l.id}/properties/${withPhoto.id}`); assert.equal(bad.status, 404);
    fixture = { ...fixture, checkedProperty: detail };
    return 'Existing isolated published property and photo fetched; wrong landlord/property pairing denied.';
  });
  await check('Suggested practical compatibility and ARCS-independent eligibility', async () => {
    if (!fixture?.checkedProperty) blocked('No published property checked for practical suggestion input.');
    const property = fixture.checkedProperty; active = r;
    await api.updateOwnProfile({ preferredLocation: property.city, budgetMin: 0, budgetMax: Number(property.rentAmount) + 100,
      householdSize: 1, householdPreferences: [], tenancyLengthMonths: Math.max(property.details.minTenancyMonths ?? 6, 12), targetMoveDate: property.details.availableFrom ?? '2026-11-01' });
    const items = await allDiscovery('suggested'); assert.ok(items.some(item => item.profile.id === fixture.id));
    for (const item of items) { assert.ok(item.reasons.length); publicOnly(item); }
    return `${items.length} suggestions returned with reasons; no ARCS/verification override used.`;
  });
  await check('Pending, duplicate/reciprocal requests, review later and recipient-only decisions', async () => {
    active = r; const connection = await api.createConnection({ recipientId: later.id, introduction: 'Hello, I value clear communication and would like to discuss a tenancy.' }); acceptedId = connection.id;
    assert.equal(connection.status, 'pending'); assert.equal(connection.conversationId, null);
    await assert.rejects(api.createConnection({ recipientId: later.id, introduction: 'Duplicate test.' }), error => error.status === 409);
    assert.equal((await raw(later, '/connections', 'POST', { recipientId: r.id, introduction: 'Reciprocal test.' })).status, 409);
    assert.equal((await raw(r, `/connections/${acceptedId}/accept`, 'POST')).status, 403);
    assert.equal((await raw(outsider, `/connections/${acceptedId}`)).status, 404);
    assert.equal((await raw(r, `/connections/${acceptedId}/messages`)).status, 409);
    active = later; const deferred = await api.decideConnection(acceptedId, 'review-later'); assert.equal(deferred.status, 'review_later');
    assert.equal((await api.decideConnection(acceptedId, 'review-later')).status, 'review_later');
    assert.ok((await api.listConnections({ direction: 'incoming', status: 'review_later' })).items.some(item => item.id === acceptedId));
    const accepted = await api.decideConnection(acceptedId, 'accept'); assert.equal(accepted.status, 'accepted'); assert.equal(accepted.conversationId, accepted.id);
    for (const account of [r, later]) { active = account; assert.ok((await api.listConnections({ status: 'accepted' })).items.some(item => item.id === acceptedId)); }
  });
  await check('Declined states persist, are terminal, and cannot be resent', async () => {
    active = r; const connection = await api.createConnection({ recipientId: decline.id, introduction: 'A synthetic request for decline-state validation.' });
    active = decline; assert.equal((await api.decideConnection(connection.id, 'decline')).status, 'declined');
    assert.equal((await api.decideConnection(connection.id, 'decline')).status, 'declined');
    assert.equal((await raw(decline, `/connections/${connection.id}/accept`, 'POST')).status, 409);
    for (const account of [r, decline]) { active = account; assert.ok((await api.listConnections({ status: 'declined' })).items.some(item => item.id === connection.id)); }
    active = r; await assert.rejects(api.createConnection({ recipientId: decline.id, introduction: 'Resend must fail.' }), error => error.status === 409);
    assert.equal((await raw(r, `/connections/${connection.id}/messages`, 'POST', { text: 'Not permitted.' })).status, 409);
  });
  await check('Landlord-initiated requests and recipient-only acceptance', async () => {
    active = l; const connection = await api.createConnection({ recipientId: outsider.id, introduction: 'Hello, I appreciate your approach to looking after a home.' }); reverseId = connection.id;
    assert.equal(connection.direction, 'outgoing'); assert.equal((await raw(l, `/connections/${reverseId}/accept`, 'POST')).status, 403);
    active = outsider; assert.equal((await api.decideConnection(reverseId, 'accept')).status, 'accepted');
    assert.equal((await raw(l, '/connections', 'POST', { recipientId: hidden.id, introduction: 'Hidden profile must be denied.' })).status, 404);
  });
  await check('Message exchange, long text, cursor pagination and reopen persistence', async () => {
    if (!acceptedId) blocked('Accepted connection unavailable.');
    active = r; assert.equal((await api.listMessages(acceptedId)).items.length, 0);
    const first = await api.sendMessage(acceptedId, '  Hello from the renter.  '); assert.equal(first.text, 'Hello from the renter.');
    active = later; const second = await api.sendMessage(acceptedId, 'Hello from the landlord.');
    const long = ('Long synthetic message for scrolling. '.repeat(100)).slice(0, 3900);
    active = r; const third = await api.sendMessage(acceptedId, long); assert.equal(third.text, long.trim());
    for (const account of [r, later]) {
      active = account; const history = await api.listMessages(acceptedId); assert.deepEqual(Array.from(history.items, item => item.id), [first.id, second.id, third.id]);
      assert.ok(history.items.every(item => typeof item.cursor === 'string'));
      assert.ok(BigInt(first.cursor) < BigInt(second.cursor) && BigInt(second.cursor) < BigInt(third.cursor));
      const login = await fetch(`${config.supabase}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: config.anon, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: account.email, password: account.password }) });
      assert.equal(login.status, 200); const session = await login.json(); active = { ...account, token: session.access_token };
      assert.equal((await api.listMessages(acceptedId)).items.length, 3);
    }
    const page = await raw(r, `/connections/${acceptedId}/messages?limit=1`); assert.equal(page.value.items[0].id, first.id); assert.equal(page.value.nextCursor, first.cursor);
    const next = await raw(r, `/connections/${acceptedId}/messages?limit=1&after=${first.cursor}`); assert.equal(next.value.items[0].id, second.id);
    const reverse = await raw(l, `/connections/${reverseId}/messages`, 'POST', { text: 'Landlord-initiated chat also works.' }); assert.equal(reverse.status, 201);
  });
  await check('Unauthorised messages, spoofing, invalid text and cursor rejection', async () => {
    assert.equal((await raw(outsider, `/connections/${acceptedId}/messages`)).status, 404);
    assert.equal((await raw(outsider, `/connections/${acceptedId}/messages`, 'POST', { text: 'No access.' })).status, 404);
    for (const body of [{ text: '   ' }, { text: 'x'.repeat(4001) }, { text: 'Spoof', senderId: outsider.id }]) assert.equal((await raw(r, `/connections/${acceptedId}/messages`, 'POST', body)).status, 400);
    assert.equal((await raw(r, `/connections/${acceptedId}/messages?after=invalid`)).status, 400);
    assert.equal((await raw(null, `/connections/${acceptedId}/messages`)).status, 401);
    active = r; assert.equal((await api.listMessages(acceptedId)).items.length, 3, 'Rejected sends must not add messages');
  });
  await check('Cross-user raw profile access does not expose private data', async () => {
    const response = await fetch(`${config.supabase}/rest/v1/renter_profiles?user_id=eq.${r.id}&select=*`, { headers: { apikey: config.anon, Authorization: `Bearer ${l.token}` } });
    const body = await response.text(); if (response.ok) assert.deepEqual(JSON.parse(body), []); else assert.ok([401, 403, 404].includes(response.status));
    assert.ok(!body.includes(`PRIVATE-${run}`));
    active = l; const profile = await api.getPublicProfile(r.id); publicOnly(profile); assert.ok(Array.isArray(profile.evidenceSummary));
  });
  await check('Legal content remains truthful for this environment', async () => {
    const response = await raw(null, '/legal/documents');
    if (response.status === 503) return 'BLOCKER: legal configuration unavailable (503); no content or consent invented.';
    assert.equal(response.status, 200); assert.ok(response.value.terms && response.value.privacyNotice);
    return `Configured documents present; demoOnly terms=${response.value.terms.demoOnly}, privacy=${response.value.privacyNotice.demoOnly}. No acceptance or consent written.`;
  });
}
const report = { run, target: { api: config.api, auth: config.supabase, project: config.project }, results,
  fixtures: Object.fromEntries(Object.entries(accounts).map(([label, account]) => [label, { id: account.id, role: account.role }])),
  acceptedApiConnection: acceptedId, reverseApiConnection: reverseId, propertyFixture: fixture?.checkedProperty?.id,
  uiPairConnectionCreated: false };
writeFileSync('/tmp/leri-phase-d-api-results.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass: results.filter(row => row.status === 'PASS').length, fail: results.filter(row => row.status === 'FAIL').length, blocked: results.filter(row => row.status === 'BLOCKED').length }));
if (results.some(row => row.status === 'FAIL')) process.exitCode = 1;
