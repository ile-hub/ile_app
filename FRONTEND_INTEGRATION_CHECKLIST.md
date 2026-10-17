# Lérí frontend integration checklist

Reviewed 14 October 2026 against the refactored source, `src/lib/api.ts`, `MVP_IMPLEMENTATION_PLAN.md` and `SCREEN_MIGRATION_MAP.md`.

**Current status: Phase 1, Phase A discovery/public browsing, Phase B person requests and basic Phase C messaging are integrated in the existing frontend.** Historical audit notes are retained; the final sections supersede their waiting notes. Fresh authenticated iOS Phase B validation and Phase C direct Accepted-row navigation/message validation passed on 16 October 2026. See the final sections for exact UI/API scope and limitations.

## Existing integrations to preserve

| Existing API client functions | Current consumers / behaviour |
| --- | --- |
| `getMe` | `src/auth/AuthProvider.tsx`: authenticated account, server-authoritative role and display name. Preserve Supabase sign-in/signup/session handling. |
| `listMyProperties`, `getProperty` | Landlord `PropertiesListScreen`, `PropertyDetailScreen` and `AddEditPropertyScreen` under `src/screens/landlord/properties/`. |
| `createProperty`, `updateProperty`, `publishProperty`, `archiveProperty` | Existing `AddEditPropertyScreen`: validation, draft identity, save/publish/archive and server verification-error handling. |
| `getLandlordProfile` | `src/screens/discover/LandlordProfileScreen.tsx`: real landlord name and published property cards when an ID is supplied; existing unavailable/404/retry handling. |
| `getProperty` | `src/screens/discover/PropertyDetailScreen.tsx`: view-only public details, landlord ownership check and Back to landlord profile. Exact address fields are omitted. |
| `listMyInterests`, `getInterest`, `expressInterest`, `declineInterest` | `src/screens/connections/ConnectionsScreen.tsx` and `ConnectionDetailScreen.tsx`: explicitly labelled existing property-interest records and actions. Do not reinterpret them as personalised requests or accepted person connections. |
| `propertyFeed`, `listPropertyInterests` | Retained client functions with no active screen callers. Do not restore a renter property feed or reconnect obsolete applicant screens. |

The existing request helper uses `EXPO_PUBLIC_API_URL`, Supabase bearer tokens, JSON request bodies, network/API errors and sign-out on HTTP 401. Preserve this behaviour. Confirm any different transport, upload or error requirements against the contract before extending it. Existing imported shared types describe the current integration, not the missing MVP capabilities.

## Screen-by-screen integration checklist

All paths below are existing frontend integration targets.

| Capability to identify in the backend contract | Connect to | Integration / completion check |
| --- | --- | --- |
| Own renter/landlord profile read and edit | `src/components/ProfileEditor.tsx`, embedded in the existing role profile screens | Load saved role fields once without overwriting dirty edits; validate and save using contracted rules. Replace unavailable Save only after integration. Refresh account display name in `AuthProvider`/`AccountProfileScreen` after confirmed save. Resolve onboarding completion/resume and photo upload/verification. |
| Public renter and landlord profiles | `src/screens/discover/RenterPublicProfileScreen.tsx`, `LandlordProfileScreen.tsx` | Adapt contracted public data into existing content components. Keep private registration drafts/documents out. Distinguish inaccessible/not-found profiles from network failure. Use real profile IDs; no generated people. |
| Public landlord property list/details | Existing landlord public profile and `src/screens/discover/PropertyDetailScreen.tsx` | Confirm public field visibility, media and property-status semantics before extending the current queries. Keep properties nested in landlord profiles, view-only, with explicit return. Preserve landlord owner CRUD. |
| Configurable ARCS catalogue and own evidence read/edit | `src/lib/trustPillars.ts`, `src/screens/renter/file/EvidenceDashboardScreen.tsx`, `EvidenceCategoryScreen.tsx` | Resolve stable option identity and catalogue ownership/versioning; load saved multiple choices, explanations and neutral statuses. Keep alternatives optional; no tenant-risk grading. Refresh dashboard and safe summary after confirmed changes. |
| Private evidence upload/removal | `src/screens/renter/file/EvidenceUploadScreen.tsx` | Confirm supported transfer mechanism, file metadata/type/size limits, cancellation, deletion and authorisation. Bind a selected file to its saved strand/pathway record; a local URI is not an uploaded attachment. Keep existing pickers/removal; show progress/failure and confirm server success. Never include private files/URLs in public profiles or requests. |
| Landlord defaults and property-specific ARCS preferences | `src/components/ArcsPreferences.tsx`, `ProfileEditor.tsx`, `src/screens/landlord/properties/PropertyPreferencesScreen.tsx` | Load/save unique ranks 1–4 and Accept/Prefer/Not needed choices. Resolve default inheritance versus custom overrides and refresh dependants after save. Persist factual occupancy/date/duration separately. Evidence preferences must not exclude or deprioritise renters in discovery. |
| Both-role suggestions and open people browsing | `src/screens/discover/DiscoverScreen.tsx` | Connect Suggested for You and Explore All independently, with contracted pagination/search/filters and profile selection. Show practical compatibility reasons, loading/empty/error/retry states; no evidence-based risk groups or numerical scores. |
| Person-to-person request creation and sharing review | `src/screens/connections/RequestConnectScreen.tsx` | Resolve recipient identity, optional property mention, permitted sharing summary, validation and duplicate-request rules. Fetch actual sharing details before submission. Enable Send only for a valid loaded recipient and contracted capability; preserve drafts on failure, and show Pending only after server confirmation. |
| Incoming/outgoing/accepted request lists and review | `src/screens/connections/ConnectionsScreen.tsx`, `ConnectionDetailScreen.tsx` | Load actual directions/statuses, sender note, public profile and permitted summary. Connect accept/decline and resolve whether Review Later needs persistence. Refresh both parties' visible statuses according to the contract. Keep legacy property interests separate until migration policy is explicit. |
| Accepted connection confirmation | `src/screens/connections/ConnectedScreen.tsx` | Replace layout-preview state only after a server-confirmed accepted connection. Carry the contracted connection identity into conversation navigation. Retain the clarification that connection guarantees no viewing/property/reservation/tenancy. |
| Conversation access, history and sending | `src/screens/connections/ConversationScreen.tsx` | Resolve accepted membership, conversation identity, history pagination, ordering and transport. Add send/retry/pending/error behaviour without duplicate messages. Subscribe/poll only as contracted and clean up on blur/logout. Pending, declined, blocked and non-member users must not gain message access through navigation. |
| Identity/registration status | Existing role verification screens and `src/auth/LandlordVerificationProvider.tsx` | Read authoritative status or explicitly contracted synthetic demo status; do not infer verification from photo/registration entry. Preserve the existing server publish gate. |

## Missing types, hooks and state requirements

Define or import these **only after reading the contract**. The descriptions are type responsibilities, not proposed schemas.

- [ ] **Types:** private editable role profiles versus permitted public profiles; photo/verification states; catalogue option identity and evidence records/statuses/attachment lifecycle; priority order/evidence preferences/default inheritance; discovery items/reasons/pagination; person request identity/direction/status/permissions; accepted connections, conversation membership and messages; validation/error details. Reconcile with `@yourorg/ile-shared-types` rather than duplicating server types locally.
- [ ] **UI adapters:** current `RenterPreview`, `LandlordPreview`, editor string fields, local evidence labels and `ContentState` are presentation/draft types. They must not become assumed API DTOs. Explicitly convert dates, currency amounts, household counts and optional values using contracted rules; avoid casts that hide mismatches.
- [ ] **Navigation identity:** `RenterPublicProfile` currently has no renter ID; `RequestConnect` carries only an optional display name; `Connected` and `Conversation` have no connection/conversation ID; `ConnectionDetail` currently carries a legacy `interestId`. Extend these existing route types with contracted identities and distinguish preview/legacy/real states. Preserve the accepted role tabs and single active screen implementations.
- [ ] **Read hooks:** reuse `useApiQuery` for keyed focus loads, refresh/retry and stale-response isolation. It currently has no shared cache, pagination, subscriptions or mutation invalidation. Add only the required extensions after transport/pagination rules are known; do not introduce a second query architecture by default.
- [ ] **Mutation state:** existing features handle busy/error locally. Apply a consistent pending/success/error pattern for new saves, uploads, decisions and messages, with duplicate-action protection and explicit refresh of affected profile/summary/list/detail views. Reconcile conflicts and retries as the contract specifies.
- [ ] **Draft ownership:** profile fields/photos, ARCS selections/explanations, preference order/choices and request notes are currently screen-local and unsaved. Resolve account-scoped draft lifetime across navigation, dirty-edit protection, discard/retry and server hydration. Keep selected files separate from confirmed server attachments; do not persist sensitive files globally by default.
- [ ] **Account state:** refresh saved account/profile information without changing auth-role authority or losing sessions. Clear drafts, cached records and any future message subscriptions on account switch/logout; preserve existing navigator/account isolation.
- [ ] **Access state:** server-confirmed membership and allowed actions must drive acceptance and chat access. UI gating complements server access controls; preview routes and legacy matched interests are not evidence of permission.

## Contract handoff and validation gate

- [ ] Receive and read `API_CONTRACT.md`; map each capability above to its actual operation, shared types, auth/ownership rules, privacy boundary, validation, errors, pagination and transport. Mark unsupported capabilities unavailable instead of guessing.
- [ ] Confirm existing-property-interest migration/compatibility and backwards compatibility for current property/auth integrations. Make no destructive data conversion from the frontend.
- [ ] Integrate into the accepted screen tree, then test persisted profile/ARCS/preferences edits, private-upload isolation, both-role discovery, personalised requests, sender status, acceptance and accepted-only chat with controlled test accounts.
- [ ] Test refresh/retry, double submission, interrupted uploads, stale responses, account switching and direct-navigation access denial. Verify private documents never enter public views, request summaries or navigation params.
- [ ] Run TypeScript and iOS/Android exports after implementation; complete device and backend access-control checks before claiming demo readiness.

**Original stop point (superseded by Phase 1 below):** documentation only, pending the contract.


## Phase 1 integration status — 14 October 2026

Implemented strictly from `API_CONTRACT.md`, after re-reading all eight pages of the MVP PDF. “Integrated” means real client calls and UI state handling are implemented, not that live server persistence has been verified.

| Documented operation | Existing frontend connection | Status |
| --- | --- | --- |
| `GET /me/profile` | Renamed existing verification context to `src/auth/ProfileProvider.tsx`; shared account/profile editor, greetings and both verification screens consume authoritative own-profile data. Account changes remount the state. | Integrated: initial loading, retry/reload, role checks and errors. |
| `PATCH /me/profile` | Existing `ProfileEditor` saves renter/landlord fields and personal prompts, explicit discoverability, household choices and registration details. | Integrated: dirty-field allowlist, nullable clears, numeric/calendar/URL/array validation, protected edits while saving/reloading, busy/error and server-response-only success. No client verification writes. |
| `GET /me/profile/preview` | Existing editor's saved public preview and request composer's profile review. | Integrated: server projection only, saved values clearly distinguished from unsaved drafts, loading/error/retry. No private documents or registration details rendered. |
| `GET /profiles/:id` | Existing public renter/landlord screens in `DiscoverStack`; renter route now accepts an optional real renter ID. | Integrated: safe public fields/portraits/prompts, role guards and unavailable/404/error states. No invented discovery results. |
| `GET /evidence/catalogue` | Existing ARCS dashboard/category and shared landlord preferences editor via `useEvidenceCatalogue` in `trustPillars.ts`. | Integrated: stable option IDs, server labels/order, loading/empty/error/retry; removed hard-coded operational menu/fallback. Selection/explanations/priorities remain explicitly unsaved. |
| `GET /legal/documents` | One shared `LegalPreferences` component in existing Signup and account Profile views. | Integrated: public request without auth/session dependency, plain-text content, version/published date, demo-only labels and 503/unavailable handling without replacement legal copy. |
| `GET /me/privacy` | Same account legal/consent interface. | Integrated: current-version terms/notice records and latest per-purpose consent read from server, loading/error/retry. |
| `POST /me/privacy/terms-acceptance` | Explicit authenticated “Accept these terms” after opening the published text. | Integrated: current version and `accepted: true`, server confirmation/timestamp, busy/error; 409 refreshes documents and requires review again. |
| `POST /me/privacy/notice-acknowledgement` | Separate authenticated privacy acknowledgement after opening the notice. | Integrated: current version and `acknowledged: true`; distinct from acceptance and optional consent, with confirmation and conflict handling. |
| `PUT /me/privacy/consents` | Separate Product updates / User research controls. | Integrated: explicit grant or withdrawal, current privacy version, server-confirmed latest value/timestamp, errors/conflicts. No automatic grant on signup, document viewing or terms acceptance. |
| Existing `GET /landlords/:id` | Public landlord properties are loaded separately only after the new public-profile visibility check succeeds. | Preserved; corrected the local response type to the documented address-free property-card projection. No bypass fallback around private/inaccessible profiles. |

### Types and state completed

- Added one contract-derived `src/lib/phase1Types.ts` because the installed shared package has only legacy profile types and still declares an address on public landlord property cards. It defines exactly documented Phase 1 fields; replace with matching shared exports when released. No node_modules edits or invented DTOs.
- Added `src/lib/profiles.ts` for explicit editable-field metadata, server-to-form hydration and dirty partial patches. It excludes role, identity/verification state, IDs and undeclared fields. Untouched registration fields are not resent, avoiding accidental invalidation of successful checks.
- Reused/renamed the existing provider rather than adding another account architecture. Authentication/Supabase and server role authority are unchanged. Account headers/greetings reflect the saved own-profile response; stale reads cannot overwrite a completed save.
- Both public content components are reused by saved previews. Current renter location and landlord registration information remain owner-only. Verification identity/photo/registration statuses come from server reads; demo-mode results are explicitly marked mock/demo.
- Added ESLint with Expo SDK 57 configuration and repeatable `typecheck`, `lint` and `test:phase1` commands. No screen or navigation-stack duplication.

### Blockers and deliberately unavailable features

- **Live verification:** the configured backend's public legal endpoint returned connection refused (`ECONNREFUSED`) on the permitted read-only check. No live profile/consent writes or end-to-end persistence tests were performed. Start/provide the Phase 1 backend and synthetic test accounts, then validate the operations above on iOS/Android. Unit-test fixtures are isolated test data, never operational UI data.
- **Evidence submission/private files/public summaries:** Phase 1 documents only the catalogue and explicitly defers the explanation/upload workflow. The reference to legacy evidence CRUD does not specify its routes/payload/storage semantics sufficiently for this new workflow. Do not infer an upload contract. Existing device pickers/removal remain local; save/upload disabled; no private file URLs sent as portrait URLs.
- **Landlord priority/default/property persistence:** no documented operations. Catalogue-backed controls remain unsaved drafts; existing property CRUD is preserved.
- **Discovery, personalised connections, acceptance and chat:** no Phase 1 operations. Real public profile lookup is supported when a known ID reaches its existing route, but no people list/recommendations/search or accepted conversations are fabricated. Sending/acceptance/messaging remain disabled; legacy property interests remain separate and unchanged.
- **Photo uploads and real verification checks:** only an explicitly public HTTPS portrait URL can be saved. Device photo drafts are excluded from profile patches. Verification is read-only; no provider/write route exists. Registration status changes are taken from the server response, never assigned locally.
- **Legal publication/setup:** backend must publish both documents; 503 is handled honestly. Existing signup/auth is not newly gated. Documents are readable before signup; protected acknowledgements/consents are recorded explicitly after login in Profile. No onboarding-completion API is documented.
- **Public property expansion:** current card projection is address-free, but legacy full property responses still contain address data. UI omits those fields; server separation, full media/details and revised statuses remain Phase 2 blockers before demo use.

### Files changed for Phase 1

- Client/types/helpers: `src/lib/api.ts`, `src/lib/phase1Types.ts` (new), `src/lib/profiles.ts` (new), `src/lib/trustPillars.ts`.
- Provider/bootstrap: `src/auth/LandlordVerificationProvider.tsx` renamed and expanded to `src/auth/ProfileProvider.tsx`; `App.tsx`. No changes to `AuthProvider` or Supabase authentication requests in this phase.
- Reused components: `AccountProfileScreen.tsx`, `ProfileEditor.tsx`, `ArcsPreferences.tsx`, `SelectionOption.tsx`, `StatusBadge.tsx`. New `LegalPreferences.tsx` is one shared interface for the previously missing legal/consent capability, embedded in existing views.
- Existing screens/routes: `src/navigation/DiscoverStack.tsx`; `src/screens/SignupScreen.tsx`; Discover, public renter/landlord profiles, RequestConnect, renter ARCS dashboard/category, both verification screens, and landlord AddEditProperty (server status consumer and lint-only text fixes).
- Tooling/tests: `eslint.config.js` (new), `scripts/phase1.test.mjs` (new isolated tests), `package.json`, `package-lock.json`. Documentation: this checklist and a Phase 1 note in `MVP_IMPLEMENTATION_PLAN.md`.

### Validation

- `npm run typecheck`: passed, including unused locals/parameters.
- `npm run lint`: passed with Expo configuration and zero-warning policy.
- `npm run test:phase1`: six tests passed: dirty/role-field allowlist, nullable clears/zero/partial budget bounds, dates/names/portrait restrictions, landlord arrays, all ten documented client operations and auth/body behaviour, and failed writes/409/503/401 handling.
- iOS and Android Hermes exports passed to `/private/tmp/leri-phase1-export`.
- Source architecture audit passed: all 60 source modules reachable, local imports resolve, 32 unique route registrations, requested role tabs retained, no active renter property feed or property-interest actions in public details; public views omit private address fields. `git diff --check` passed.
- Pending: live backend persistence, cross-account access checks, consent history/idempotency and actual on-device verification. Static checks and isolated transport tests do not prove those outcomes.


## Confirmed isolated environment and live Phase 1 API check

The earlier connection refusal is resolved with the confirmed local handoff. `.env.local` (git-ignored) now uses NestJS port 3000 with no prefix and the matching public anon key from isolated project `leri-phase2-validation-20261014-final` on Auth port 55321. Expo was restarted; the original stack and production settings were untouched.

Real synthetic renter sign-in, own profile access, bio/story PATCH and subsequent GET persistence, safe public preview, and all 54 catalogue options passed using the existing API client and actual server responses. Health/legal returned 200 and unauthenticated `/me` returned 401. See `PHASE1_LIVE_VALIDATION.md` for the full results and scope.

The real simulator app loads its existing login screen, but automation did not complete the actual Profile-screen edit/save/reload sequence. That UI check remains explicitly unverified; API success is not substituted for UI success. Phase 2 frontend integration remains paused pending the requested screen-level validation. No source code or API/auth architecture was changed for this connectivity pass.

## Renter UI refinement (no Phase 2 integration)

Existing profile save/reload, public preview, catalogue, legal/privacy/consent and read-only verification integrations remain attached to the existing provider/client. Renter profile editing now has focused About Me, Housing Preferences and Personal Story sections; legal/consent/account/logout moved to Settings within the same account screen. Discover/Connections have concise unavailable states with developer preview entry points removed; existing property enquiries remain accessible separately. No endpoint/auth/environment changes, new screens, operational fixtures or optimistic success added. TypeScript, lint, six contract/client regression tests and iOS/Android Hermes exports pass; screen-level persistence and actual-device interaction remain unverified, so Phase 2 integration stays paused. Full UI changes/manual procedure are recorded in MVP_IMPLEMENTATION_PLAN.md.

## Phase A — people discovery/public browsing (implemented; awaiting review)

This section supersedes earlier waiting notes for discovery, public summaries and public property browsing. The synchronized contract now documents these operations. Phase B/C requests/decisions/messaging and Phase D editing integration have NOT begun.

| Endpoint | Existing consumer | Phase A behavior |
| --- | --- | --- |
| `GET /discovery?mode=suggested&limit=20[&after=UUID]` | `DiscoverScreen.tsx` | Real opposite-role cards, server explanation strings, honest initial/empty/error/refresh states. Empty candidate pages with a continuation cursor offer Keep looking, never fabricated matches. |
| `GET /discovery?mode=all&limit=20[&after=UUID]` | Same Discover screen | Independent browsing, stable cursor continuation, profile ID deduplication, portrait/avatar/name/bio/location/verification and landlord property count. No property feed, score or client-side compatibility engine. |
| `GET /profiles/:id` | Existing landlord/renter detail screens | Existing safe profile queries retained; added actual ARCS summaries/priorities, refresh and revoked-visibility handling. Navigation carries IDs only. Private document payloads/explanations/registration details remain absent. |
| `GET /landlords/:landlordId/properties` | Existing landlord profile property section | Replaces the legacy `/landlords/:id` card fetch here. Available public cards with actual area/currency/photos count; no private address fallback. Existing legacy client functions remain intact. |
| `GET /landlords/:landlordId/properties/:id` | Existing public PropertyDetailScreen | Typed public details, explicit field allowlist, unavailable/not-found/error/refresh and Back to landlord profile. No property application or connection mutation. |
| `GET /landlords/:landlordId/properties/:id/photos/:photoId/download` | Same property screen's local gallery | Actual signed photo loading, previous/next controls, captions, unavailable/error/retry; fresh links on screen focus and retry. No private evidence download endpoint or stored signed URL in navigation/global state. |

Extended existing `phase1Types.ts` with the documented public property/gallery, ARCS summary/preference and discovery page shapes because installed shared exports still predate the contract. Extended existing `useApiQuery` with opt-in cursor pagination (no new provider/cache/library), preserving existing callers. Refresh/focus/mode changes invalidate pending pages; failed continuation retains data/cursor and displays an error; double loads and non-advancing cursors are guarded. Default query/auth and profile-save behavior unchanged.

Validation: TypeScript, lint, all 11 tests in `npm run test:phase1` (including four Phase A transport/pagination/race regressions), import/navigation audit and iOS/Android Hermes exports passed. Exports: `/private/tmp/leri-phase-a-export`. Architecture remains 60 reachable source modules and 32 distinct routes, correct role tabs and no active renter property feed.

Real read-only checks through the existing API client against NestJS 3000 / isolated Auth 55321 passed using the approved synthetic renter: Suggested traversed two pages with zero matches; Explore traversed two pages with 25 public landlords; actual public profile, nested property list/detail, signed photo bytes, public renter preview/ARCS summary and wrong-landlord 404 passed. Public responses were recursively checked for private address/profile/evidence fields. Zero suggestions is a real response, not a blocker or a simulated empty list. No profile/property/connection writes or backend changes were made.

Simulator: existing signed-out login screen inspected; authenticated discovery cards, mode switching, pagination, profile/property/gallery/back/refresh interactions and landlord login were not manually verified. No screen-level pass is inferred from API tests. Android was bundled, not run interactively. No contract mismatch found in integrated operations. Manual acceptance remains pending: sign in -> Explore All -> View profile -> View property -> Next photo -> Back to landlord profile; switch Suggested/Explore, continue empty Suggested pages, pull to refresh and review landlord-facing renter profiles with an approved landlord session. Sending requests remains unavailable until Phase B is explicitly reviewed/authorized.

Complete changed-file list for Phase A (existing files only): `src/lib/api.ts`, `src/lib/phase1Types.ts`, `src/lib/profiles.ts`, `src/lib/useApiQuery.ts`, `src/screens/discover/DiscoverScreen.tsx`, `src/screens/discover/LandlordProfileScreen.tsx`, `src/screens/discover/RenterPublicProfileScreen.tsx`, `src/screens/discover/PropertyDetailScreen.tsx`, `scripts/phase1.test.mjs`, `FRONTEND_INTEGRATION_CHECKLIST.md`, `SCREEN_MIGRATION_MAP.md`, `MVP_IMPLEMENTATION_PLAN.md`. No new/removed files or navigation routes.

## Phase B — person-to-person requests (16 October 2026; awaiting review)

Phase A is retained and the user authorized Phase B. This section supersedes historical request/acceptance waiting notes. Phase C messaging has NOT begun.

| Contracted operation | Existing frontend integration |
| --- | --- |
| `POST /connections` | Existing RequestConnect composer sends exactly `{ recipientId, introduction }`. Optional property mention is included in the introduction text, never a property/application field. Combined text validated to 3,000 characters, nonblank note required. Opposite-role real recipient and owner discoverability checked; saved public profile preview required before sending. Ref lock/busy controls prevent concurrent submission, drafts retained on failure, 409 explained without invented success. Genuine server response produces Request sent plus its status. |
| `GET /connections` | Existing Connections list keeps Incoming/Outgoing/Accepted row. Incoming/outgoing use direction only so pending/review_later/accepted/declined remain visible; Accepted uses status=accepted across both directions. Limit 20 and UUID continuation; existing paginated query hook, deduplication, focus refresh, pull refresh, initial/empty/error/page retry states. Earlier property enquiries remain secondary and unchanged. |
| `GET /connections/:id` | Existing ConnectionDetail handles a typed person connection ID separately from the preserved legacy interest ID. It reads the current note/status and safe counterparty profile; hidden profiles remain unavailable, no private files shown. Connected confirmation also loads this endpoint and checks actual accepted state, participant identity and conversation ID. |
| `POST /connections/:id/accept` | Recipient-only control with synchronous mutation lock, disabled while refreshing/error, server result required. Replaces existing detail with existing Connected screen using the confirmed ID. Sender/third-party controls never enabled. |
| `POST /connections/:id/decline` | Same recipient/identity/outstanding-state guard; server-confirmed Declined state, success/error. Outgoing sender cannot decline their own person request. |
| `POST /connections/:id/review-later` | Same guard; persisted Review later status remains visible to both parties. It does not unlock messaging; repeating the current review-later action is disabled in UI. |

Existing route types extended, no new route/screen: RequestConnect requires recipientId; ConnectionDetail accepts mutually exclusive connectionId/interestId; Connected requires connectionId. Public profile buttons pass only recipient IDs, reject own/same-role destinations and hide redundant Request actions in public sharing/review content. The confirmation and accepted list/detail say messaging is ready but app messaging is coming soon; the button is disabled and no conversation layout-preview link is shown. No GET/POST messages client methods, polling, sending or Phase C navigation were added.

Privacy/compatibility: existing saved public content components display only safe fields/categories/status; no private uploads/explanations/addresses or full own-profile object enters connection routes. Profile provider/authentication, Phase A discovery/property gallery, private ARCS editing and landlord owner CRUD are untouched. Earlier interest actions remain under an explicitly separate legacy branch in the existing detail file. No migration or reinterpretation of old interests as acceptance.

Checks: TypeScript, lint, all 16 tests in `npm run test:phase1`, navigation/import audit (60 source modules, 32 unique routes, correct tabs, no active renter property feed/private address rendering), and iOS/Android Hermes exports pass. Output `/private/tmp/leri-phase-b-export`. Regression coverage adds exact payload/query/action transport, recipient vs sender/outsider/terminal-state permissions, combined note limit, full-state direction lists, page deduplication and 400/403/404/409 rejection. Phase A race/pagination and Phase 1 save/privacy tests remain green.

Live validation: current frontend client authenticated via real Supabase signup sessions for three NEW clearly labelled synthetic accounts, server roles verified, only their profiles made public. Pending creation, incoming/outgoing retrieval, sender accept/decline/review denial (403), outsider detail denial (404), duplicate/reciprocal rejection (409), review-later persistence, acceptance/idempotent confirmation/both accepted lists and landlord-initiated renter decline all passed. Shared profiles recursively checked for private fields. No backend code/environment/production changes, reset or deletion; prior profiles/requests untouched. No messaging endpoints called. Temporary manual-test credentials are in `/private/tmp/leri-phase-b.credentials.local` with mode 600, outside the repository; do not paste/share passwords. Variables: RENTER_EMAIL/PASSWORD, LANDLORD_EMAIL/PASSWORD, OTHER_RENTER_EMAIL/PASSWORD. Accounts and synthetic accepted/declined requests are retained.

Simulator: existing signed-out login inspected only. Actual authenticated composer, combined-note review/send, list switching/paging, recipient decisions, sender-disabled controls, confirmation, keyboard scrolling and Android interaction are not manually verified. API/client success is not screen-level success. No integrated-contract mismatch found. Some backend fields (withdraw/resend after decline) remain unsupported and no controls were invented.

Complete changed-file list (existing files only, Phase B): `src/lib/api.ts`, `src/lib/phase1Types.ts`, `src/lib/profiles.ts`, `src/navigation/DiscoverStack.tsx`, `src/navigation/ConnectionsStack.tsx`, `src/screens/discover/LandlordProfileScreen.tsx`, `src/screens/discover/RenterPublicProfileScreen.tsx`, `src/screens/connections/RequestConnectScreen.tsx`, `src/screens/connections/ConnectionsScreen.tsx`, `src/screens/connections/ConnectionDetailScreen.tsx`, `src/screens/connections/ConnectedScreen.tsx`, `scripts/phase1.test.mjs`, `FRONTEND_INTEGRATION_CHECKLIST.md`, `SCREEN_MIGRATION_MAP.md`, `MVP_IMPLEMENTATION_PLAN.md`. No files created/removed, no new screens/routes/providers. STOP pending Phase B review; Phase C is not authorized yet.

## Section 8 compliance review and authenticated iOS validation — 16 October 2026

Re-read all eight pages of the original `Leri app des.pdf`, with Section 8 as the connection-flow authority, and checked the synchronized contract and migration/implementation documents. No missing implementation step was identified; no application code, route, component, backend code or environment configuration was changed for this review. The pre-send sharing review already exists and must not be duplicated.

| PDF requirement | Existing implementation / review finding | This review's simulator evidence |
| --- | --- | --- |
| Full public profile → Request to Connect | Both existing public role screens pass the person ID to the one composer. | Renter logged in through the real login form, browsed Explore All, opened a real landlord profile, scrolled to Request to Connect and opened it. |
| Exact introduction prompt; optional property mention | PDF wording present. Optional mention is part of the note; request payload has only recipientId/introduction. | Prompt, person/application clarification and optional field visible; personalised note entered. Separate optional-field entry was not reliably validated because native input focus/field height changed during automation. |
| Review sharing BEFORE sending | Review loads `GET /me/profile/preview` and reuses public content. Send requires that preview and the unchanged reviewed introduction; either input change invalidates review. | Empty composer showed Send disabled; review showed loading, then actual saved public preferences and ARCS statuses. Private documents, private explanations and account/registration details were absent from the inspected content. No new review screen needed. |
| Genuine sent confirmation and Pending Outgoing | Existing success branch requires successful `POST /connections`; Outgoing reloads server data. Ref lock, busy controls and 409 handling remain. | Fresh Send/Pending and duplicate-send/error interactions not exercised in this session. |
| Incoming sender note/public profile/preferences/evidence | Existing person detail renders the real counterparty public projection and introduction. | Landlord logged in normally; Incoming showed the existing accepted request. Detail displayed the renter's note/public profile and safe ARCS statuses; scrolled to the privacy explanation. These fixtures have no selected evidence, so populated categories/private-document exclusion were not tested with an uploaded-document fixture. |
| Recipient-only Accept/Decline/Review Later | Existing guard checks recipient ID, distinct sender, incoming direction and outstanding state; only successful server decisions update state. | No pending/review-later fixture available among supplied account pairs. Decision controls/transitions remain manually unverified; automated recipient/sender/outsider checks pass. |
| Sender status and accepted confirmation | Direction views retain all statuses. Actual acceptance opens the existing Connected screen, which re-fetches accepted membership and displays the exact heading and full no-guarantee clarification. | Renter and landlord Accepted tabs both showed their existing accepted connection. Landlord Outgoing showed its separate Declined request. Fresh acceptance → You're Connected! navigation not exercised. |
| Messaging readiness without Phase C | Accepted detail has disabled Messaging coming soon; confirmation includes no viewing/property/approval/reservation/tenancy guarantee. No message API methods added. | Disabled messaging and no-guarantee copy observed in accepted detail. No messaging operation performed. |

Simulator environment: existing Expo Go on iPhone 17 Pro / iOS 26.5, unchanged local NestJS 3000 and isolated Supabase Auth 55321. Credentials read privately from the supplied local file; passwords were never printed or saved into repository/report files. Password-saving prompts dismissed; host/device pasteboards cleared after credential entry. Normal logout/login used for the role switch; authentication was not bypassed. Screenshots remain outside the repository under `/private/tmp/leri-review-*.png`.

Actual UI checks passed: both-role sign-in, renter discovery/public-profile/composer access, empty Send gating, personalised draft entry, sharing-review loading and public summary, Connections tabs/empty incoming state, accepted lists under both roles, recipient public detail/privacy summary, declined outgoing display, scrolling and normal detail back navigation. Native desktop Simulator focus/text entry was intermittent; no app error was established from those automation issues. Software-keyboard avoidance, refresh gestures, double submission, backend-error rendering, pending recipient controls, review-later persistence and the fresh success-confirmation sequence remain unverified on device. API/regression results are not substituted for these UI tests.

Fixture blocker: the supplied renter/landlord pair is already **accepted**, and the supplied other renter/landlord pair is already **declined**. The documented unordered-pair uniqueness and terminal-state rules prevent recreating either request, including in reverse. An unused opposite-role synthetic pair (additional pairs for decline/review-later) is required to complete the requested fresh journey without deleting/resetting records or creating accounts outside the authorized request-only scope. Synthetic request changes through the app were authorized, but none were performed in this review. Existing records were preserved.

Quality checks passed: `npm run typecheck`, `npm run lint`, all **16** `npm run test:phase1` regression tests, navigation/import audit (**60 reachable modules, 32 unique routes**, correct role tabs, no renter property feed/private-field rendering), and iOS/Android Hermes exports to `/private/tmp/leri-phase-b-review-export`. No PDF-compliance source fix was necessary. Exact repository files changed for this review: **FRONTEND_INTEGRATION_CHECKLIST.md and MVP_IMPLEMENTATION_PLAN.md only**. Phase C remains paused pending review and approval.

## Fresh authenticated Phase B iOS validation — 16 October 2026

This section supersedes the preceding unused-pair blocker and manually unverified request/decision notes. The user authorized new synthetic accounts through normal authentication/profile flows and synthetic request changes through the app/documented API. Only the existing isolated NestJS `localhost:3000` and Supabase Auth `localhost:55321` / PostgreSQL `55322` environment was used. No direct SQL, resets, migrations, backend/matching-code changes, original development/production access or changes to unrelated records.

### Synthetic fixtures retained for review

Four new accounts were created using ordinary public-anon Supabase signup with the application's role/display-name metadata, followed by `GET /me` and documented `PATCH /me/profile`. Only these new profiles were made discoverable and given clearly synthetic public biographies/preferences. Each account had zero requests before this test.

| Display name | Account ID |
| --- | --- |
| Synthetic UI Demo Landlord | `f2475ff2-3469-48e5-9aa4-8e0bd92bc2a3` |
| Synthetic UI Accept Renter | `0d191b8e-3ce1-4976-8a61-0041c78ddd7e` |
| Synthetic UI Decline Renter | `b4d0f3c0-d732-4ead-b464-f1ae327629c3` |
| Synthetic UI Later Renter | `cca1450e-b810-4560-96b6-5e3502839575` |

Each renter forms a different previously unused person pair with the demo landlord. Existing terminal requests were neither reset nor reused.

| Request ID | Pair / final state | Creation / decision surface |
| --- | --- | --- |
| `c1ec08a4-c009-45b4-8536-7b61fe83120f` | Accept renter → demo landlord / **Accepted** | Entire primary request, sharing review, Send and acceptance performed in iOS Simulator. |
| `773ea1e9-e05a-4428-8063-8bcf4fa43057` | Decline renter → demo landlord / **Declined** | Pending fixture created through documented `POST /connections`; landlord Decline and both status views tested in Simulator. |
| `6d7c56ca-c256-486f-a15b-2a1ef9073254` | Later renter → demo landlord / **Review later** | Separate pending fixture created through documented `POST /connections`; landlord Review Later and both status views tested in Simulator. |

Credentials remain only in `/private/tmp/leri-fresh.credentials.local` (mode 600), outside the repository. No passwords, tokens or login emails are included here. Native host/device pasteboards were cleared after entry. Temporary native GUI/OCR helpers and evidence screenshots are outside the repository in `/private/tmp`; screenshot directory `/private/tmp/leri-fresh-ui` has mode 700. These are test tooling, not application files or parallel implementations.

### Actual authenticated Simulator observations

Existing Expo Go on iPhone 17 Pro / iOS 26.5, real login screen and normal profile logout used throughout; no session injection or authentication bypass.

- **Primary journey passed:** Accept renter logged in → Discover / Explore All → real demo landlord card → full public landlord profile → Request to Connect → personalised introduction → Review introduction and sharing → saved public profile/preferences/ARCS status review → Send → genuine Request sent / Pending → Pending Outgoing with the exact note. Optional property mention was left blank, as permitted.
- **Recipient acceptance passed:** demo landlord logged in → Incoming → fresh Pending request → read the sender's note and safe public profile/story/preferences/ARCS summaries → Accept connection → existing **You're Connected!** confirmation, Accepted connection badge, full no-viewing/property/approval/reservation/tenancy clarification and disabled Messaging coming soon. Normal Back to Connections worked; the landlord's Accepted tab displayed only the accepted renter.
- **Sender acceptance persistence passed:** Accept renter logged back in, opened Outgoing, pulled to refresh and saw Accepted; Accepted tab contained the same connection. Existing detail displayed Accepted and the connected confirmation/clarification with messaging disabled. No recipient decision controls appeared.
- **Decline passed:** landlord opened the separate Pending Decline renter request, reviewed public content and tapped Decline request. Request declined appeared; refreshed Incoming showed Declined. Decline renter logged in separately and saw Declined in Outgoing and detail after refresh, with no decision or messaging controls.
- **Review Later passed:** landlord opened the separate Pending Later renter request and tapped Review later. Refreshed Incoming showed Review later. Later renter logged in separately and saw Review later in Outgoing/detail after refresh, with “Waiting for their decision. Only the recipient can accept or decline.” No sender decision or messaging controls appeared.
- **Duplicate prevention/error passed:** the primary Send button received two rapid taps, but genuine success appeared once and independent API reads found exactly one request. After acceptance, the sender reopened the same landlord profile/composer, reviewed sharing and attempted another request. The real backend error “A request already exists between these people” and the existing 409 explanation were displayed; no false success or second connection was created. Existing request and draft/review content were preserved.
- **Keyboard/scroll/back/refresh passed for exercised paths:** the software keyboard was displayed with the note field visible above it, then dismissed; the long sharing review and recipient/public detail scrolled normally. Empty introduction left review/Send disabled. Public-profile/composer entry, detail back navigation, role switching, list focus reload and pull-to-refresh retained genuine server statuses. No app error was found from these gestures. Temporary GUI automation needed focus/OCR/scroll-target corrections and a wait for normal logout completion; these were test-helper fixes, not app changes.
- **Privacy/messaging:** inspected UI showed public fields and neutral ARCS statuses only; no account email, registration details, private documents/explanations or private addresses in sharing/request content. These synthetic renters have no uploaded files or selected evidence, so populated evidence/upload privacy was not separately exercised on-device. Messaging remained disabled throughout; no conversation route or message endpoint was opened/called.

### Minimal existing-screen fix

The sender's accepted detail originally used “You're connected” and its clarification omitted the explicit word “property”. Updated only two existing text strings in `src/screens/connections/ConnectionDetailScreen.tsx`: **You're Connected!** and the complete no-guarantee wording. Reopened the accepted sender detail in Simulator and verified both strings and the disabled messaging button. Existing acceptance flow, server checks, navigation, client and authentication are unchanged. No screens/routes/components were added or duplicated.

### Automated and independent API results (separate from UI evidence)

- After the two-string change: TypeScript, lint, all **16 regression tests**, navigation/import audit (**60 reachable source modules, 32 unique routes**, exact role tabs, no broken imports/private-field rendering/renter property feed), and `git diff --check` passed.
- iOS and Android Hermes exports passed after the change: `/private/tmp/leri-phase-b-fresh-final-export`.
- Existing frontend client + real Supabase sessions independently verified exactly one request per new renter, final Accepted/Declined/Review later states for both parties, safe public projections, sender acceptance denial (**403**), duplicate creation rejection (**409**) and the landlord's accepted-only list. No message endpoint called. One diagnostic authentication attempt failed during account switching; a fresh retry and all final checks passed. This was not counted as a successful UI operation.

**Exact repository files changed for this validation:** `src/screens/connections/ConnectionDetailScreen.tsx`, `FRONTEND_INTEGRATION_CHECKLIST.md`, `MVP_IMPLEMENTATION_PLAN.md`. No new/removed application files. Other working-tree changes predate this task.

No remaining blocker for the exercised Phase B journey. Offline/interrupted-network recovery, populated private-upload fixtures, optional property-mention entry and interactive Android/accessibility checks were not exercised in this session; Android was exported only. No claim of Phase C or full MVP demo completion. **STOP: Phase C remains paused until separately approved.**

## Phase C — direct Accepted entry and basic messaging, 16 October 2026

The user's Phase C UX request authorizes this integration and supersedes the earlier Phase C pause. All work extends existing screens, client, helpers and routes; no Messages tab, new screen, component file, query architecture or second chat system.

- **Accepted list:** each existing row shows the real public name and photo where supplied, with an initial fallback for absent/failed photos. The whole row opens the existing Conversation directly using its connection ID; no Open conversation button or confirmation detour. Only accepted participants with the confirmed conversation identity can activate the row.
- **Incoming/Outgoing:** existing note/status/request-detail/recipient decision flows retained, including accepted records shown in those direction lists. They do not acquire chat-row navigation. Legacy property interests remain separate.
- **Acceptance moment:** the existing genuine You're Connected! confirmation remains attached to successful acceptance. Its Start conversation action can enter the same existing conversation route. Routine Accepted-row entry skips the confirmation. Accepted request detail points users to Accepted instead of claiming messaging is unavailable.
- **Conversation:** reuses the existing screen/container/form/button/card components, re-fetches connection identity and accepted membership, loads actual chronological messages and supports explicit refresh/focus reload and cursor continuation. No real-time claim, subscription or background polling. Account/connection-keyed content isolates drafts and confirmed messages between people.
- **Sending:** nonblank trimmed text, maximum 4,000 characters; synchronous submission lock, no optimistic messages, draft cleared only after a successful server response. Errors retain the draft and explain uncertain delivery after a network interruption. No automatic POST retries because the contract has no idempotency key. Access errors disable messaging until a fresh check; pending/declined/review-later/nonmembers cannot gain messaging through navigation.
- **Back navigation:** Simulator exposed a stale content view after the native Conversation back transition. A localized explicit `navigation.goBack()` handler in the existing Conversation header returned to the Accepted list; repeat direct entry then worked. It does not change route/tab structure or other screen headers.

| Endpoint | Integration |
| --- | --- |
| `GET /connections/:id` | Reused for accepted participant checks on Conversation entry and refresh. |
| `GET /connections/:id/messages?limit=50[&after=cursor]` | Existing API client / Conversation history and More messages; cursor remains a string. |
| `POST /connections/:id/messages` with `{ text }` | Existing composer / server-confirmed send. No sender/status/conversation fields invented in the payload. |

### Actual authenticated iOS Simulator evidence

Used the existing isolated environment and Phase B synthetic accepted pair / connection `c1ec08a4-c009-45b4-8536-7b61fe83120f`; private credentials remained outside the repository. No additional accounts, properties or connection requests were created for Phase C. Only two new synthetic messages were written through the app.

- Renter opened Connections → Accepted: real landlord name and initial fallback visible. Tapping the person's name opened **Conversation** directly with actual empty history and message composer; no intermediate confirmation or extra button.
- Renter sent a message through the UI; the real saved message and Message sent confirmation appeared. Reopening the row fetched the persisted message directly.
- Landlord signed in through the normal login form, opened Accepted and tapped the renter row directly. Conversation loaded the renter's actual message. Landlord replied through the UI; both messages appeared. Back returned to the Accepted list, and a second row tap reopened the same Conversation/history directly.
- A non-accepted person's name tapped while Incoming was active did not enter messaging. Existing request rows retained Review request. No Messages tab appeared. Temporary automation needed wrapped-name matching, settled-tab checks and dismissal of the native password-save prompt; those helper corrections are not app changes.
- These fixtures have no profile photos: initial fallback was verified on-device; successful remote-photo rendering was not separately exercised. No fabricated portrait added.

### Automated and independent real-API evidence

- TypeScript, strict lint, **19 regression tests**, navigation/import audit (60 reachable modules, 32 unique routes, unchanged requested role tabs), whitespace check and iOS/Android Hermes exports pass. Export directory: `/private/tmp/leri-phase-c-final-export`.
- Three regression additions cover accepted-only participant/conversation identity, deduplicated chronological history with 18-digit string cursors, and exact message methods/paths/query/body with 403/404/409/500 rejection.
- Independent existing-client reads confirm **exactly two** persisted UI messages, one from each participant, visible to both accounts; DTO keys match the contract and cursor continuation returns the second message after the first.
- Real API denies message history for declined/review-later fixture connections (409) and denies those accounts access to the accepted pair's conversation (404). No denied operation was represented as successful UI persistence.

**Exact existing files changed:** `src/lib/api.ts`, `src/lib/phase1Types.ts`, `src/lib/profiles.ts`, `src/navigation/ConnectionsStack.tsx`, `src/screens/connections/ConnectionsScreen.tsx`, `src/screens/connections/ConversationScreen.tsx`, `src/screens/connections/ConnectedScreen.tsx`, `src/screens/connections/ConnectionDetailScreen.tsx`, `scripts/phase1.test.mjs`, `FRONTEND_INTEGRATION_CHECKLIST.md`, `MVP_IMPLEMENTATION_PLAN.md`, `SCREEN_MIGRATION_MAP.md`. No application files created/removed; no backend/auth/environment/package changes. Earlier working-tree changes are not attributed to this task.

Remaining manual coverage: remote profile-photo success/failure, long-history UI pagination, interrupted/ambiguous sends, interactive Android and accessibility/device variants. Manual refresh is required for new messages; no WebSocket/push, read receipts, attachments or background delivery implemented. Phase D evidence/preferences/owner-property editing expansion is unchanged; this is not a claim of complete MVP readiness.


### Conversation UI refinement — 16 October 2026

Refined the existing Conversation only: compact public-name/photo-or-initial header, sage received and forest-green sent bubbles, compact timestamps/date separators, nearby-message grouping, bottom-filled virtualized history, keyboard-aware anchored composer and circular send control. Pull-to-refresh replaces the prominent refresh button. Conversation hides the existing role tab bar; returning restores it. The required tenancy clarification remains in the existing connection confirmation/detail flows. Accepted-row direct navigation, API methods, authentication, participant authorization, pagination, server-confirmed sends and draft retention on errors are preserved. No new application files, routes, backend changes or configuration changes.

**Exact files changed for this refinement:** `src/screens/connections/ConversationScreen.tsx`, `src/navigation/ConnectionsStack.tsx`, `src/navigation/renter/RenterTabNavigator.tsx`, `src/navigation/landlord/LandlordTabNavigator.tsx`, `FRONTEND_INTEGRATION_CHECKLIST.md`. Earlier Phase C working-tree changes are not attributed to this refinement.

**Automated checks:** TypeScript, strict lint, all 19 regression tests, navigation/import audit (60 reachable modules, 32 unique routes) and both iOS/Android Hermes exports passed after the final source change. Export output: `/private/tmp/leri-chat-ui-verified-export`.

**Actual authenticated Simulator observations:** Existing isolated synthetic accepted connection `c1ec08a4-c009-45b4-8536-7b61fe83120f`, signed in as Synthetic UI Demo Landlord with Synthetic UI Accept Renter as counterparty. Both participants' persisted messages rendered with the correct alignment and colors. Verified initial loading, short-history bottom positioning, disabled empty-draft send, long multiline draft above the iOS software keyboard, keyboard closing without losing the draft, genuine submission of one additional long synthetic message, paragraph wrapping, history scrolling, persisted history on re-entry, Back and restoration of landlord tabs. No credentials exposed or unrelated records changed. Preview: `/private/tmp/leri-chat-reenter-static.png`.

**Manual coverage limits:** Final automated pull-to-refresh and long-history keyboard attempts landed on Connections and are not counted as chat checks. Direct entry was separately observed using a verified static tap after OCR targeting failed. Pull-to-refresh completion, smaller devices, dynamic type/screen reader, interactive Android, renter-role tab restoration after this styling change, remote-photo rendering, empty/error/offline states, nearby-message grouping and large paginated histories remain unverified in this refinement. No claim of real-time messaging, delivery or read status.
