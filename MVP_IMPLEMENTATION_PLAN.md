# Lérí MVP implementation plan

Reviewed 14 October 2026 against **all 8 pages** of `/Users/martins/Downloads/Leri app des.pdf`, the official MVP functional specification for the 29 October 2026 demo. Page references below refer to that PDF. The document defines product requirements; it does not authorise external publication or collecting real identity/financial documents.

## Assessment and constraints

The repository is an Expo SDK 57 / React Native 0.86 app with Supabase authentication, separate role navigation, typed property APIs and property-bound tenancy interests. It is a useful foundation, but is not yet the people-first MVP. Working code and API calls are evidence of frontend implementation, not proof of backend behaviour or a passing live demo.

Read https://docs.expo.dev/versions/v57.0.0/ before changes, as required by AGENTS.md. No `API_CONTRACT.md` is present in this project. The backend is a separate project. Existing `src/lib/api.ts` and shared types describe the current integration, **not an approved contract for new MVP features**. Preserve existing integrations; do not invent endpoints, payloads, verification checks, upload storage or chat transport. Wait for the backend's `API_CONTRACT.md` before implementing API-dependent screens or replacing the property-interest workflow.

The working tree already contains substantial uncommitted changes and staged deletions. Preserve those changes and do not restore deleted legacy providers/screens or remove useful property management, authentication, query states or file pickers.

Status: **Existing** = implemented in frontend, runtime unverified; **Incomplete** = some UI/integration exists but requirement is not satisfied; **Missing** = no implementation found.

## Feature inventory (before the first frontend pass)

| Requirement | Status | Evidence and work required |
| --- | --- | --- |
| Role registration/login (pp. 2, 4) | Existing foundation | `SignupScreen`, `LoginScreen`, `AuthProvider`, `lib/auth.ts`: email/password, display name, renter/landlord selection, secure session and server role lookup. No onboarding completion gate. Password recovery, passkey and code-login buttons only report unavailable. |
| Terms/privacy/optional consents (pp. 2, 4, 8) | Missing | No notice, terms screen, acceptance control or versioned acceptance. Obtain approved content; keep optional choices separate. Do not invent legal text or claim consent is stored. |
| Renter identity, verified photo (pp. 2, 8) | Incomplete | `VerificationStatusScreen` truthfully says not connected. No provider, photo flow or completed verification. Synthetic demo identities must carry explicit mock labels. |
| Renter editable profile/onboarding (p. 2) | Incomplete | `AccountProfileScreen` only displays name/email/role; `PreferencesScreen` edits local budget, location, household type and duration with a no-op Save. Need bio, photo, current/preferred location, budget, move date, duration, household size/preferences and profile editing/persistence. |
| Renter personal story (p. 2) | Missing | Add optional editable “Beyond the paperwork, why would you make a great tenant?” prompt. |
| Flexible ARCS catalogue (pp. 2–4) | Incomplete | `trustPillars.ts` has four strands and only 10 suggested pathways. `EvidenceCategoryScreen` navigates one option at a time. Need full configurable catalogue, multi-select, explanation per strand and optional files; no mandatory all-document checklist. |
| Evidence attachments/status/privacy (pp. 4, 8) | Incomplete | `EvidenceUploadScreen` picks camera/library/documents and removes its local selection. Submission has no handler and becomes visually enabled after selection. No persisted evidence, private storage, access control, deletion or actual status. Dashboard always says nothing submitted. Use synthetic files for demo. |
| Safe public preview (pp. 2, 4, 8) | Missing | `TrustProfileScreen` is a placeholder confidence/risk/suitability view, not a public preview. Replace with permitted bio/preferences and evidence categories/status only. No files, account numbers or inferred character/risk labels. |
| Landlord identity/registration/type (pp. 4–5) | Incomplete | `LandlordVerificationScreen` collects one number; provider stores pending in memory only. No actual submission/review despite “under manual review” copy; provider is above role navigation and does not clear on logout. No KYC, multiple numbers or landlord type. Registration alone must not imply verified identity. |
| Landlord editable profile/prompts (p. 5) | Missing | Account shell exists. Need verified/demo photo, business/name, experience, property count, areas, bio, communication style/approach, required “What can a great tenant expect from you as a landlord?” and optional tenancy prompt. |
| Landlord ARCS priorities/evidence choices (p. 5) | Missing | No reorderable unique ranks 1–4, Accept/Prefer/Not needed choices or default preferences. Property preferences currently contain only local household/duration chips. Evidence preferences must never filter or lower discovery ranking. |
| Property default/custom priorities (pp. 5–6) | Missing | Add “Use my default preferences” / “Customise for this property”; keep factual constraints separate from supporting evidence. |
| Property creation/management (pp. 5–6) | Incomplete | `AddEditPropertyScreen` supports address/city/postcode, bedrooms, rent, three rule choices, create/update/draft/publish/archive with API error handling. Preserve this work. See field audit below. |
| Landlord profile property list (pp. 1, 6–7) | Incomplete | Renter `listings/LandlordProfileScreen` fetches name/member-since/properties and opens details. Missing full landlord story/highlights/verification and connection action. It exposes address lines rather than default-private address/public area. |
| Properties only inside landlord profiles (pp. 2, 6) | Missing / current conflict | Renter Listings tab directly fetches properties; home points to listings; matched screens also expose property summaries. Remove the standalone renter property feed from active navigation when people discovery is available. Property detail must be view-only with “Back to landlord profile”; it currently sends property interests and offers “Not a fit”. Preserve reusable details/landlord property management. |
| Both-role Suggested for You / Explore All (pp. 6–7) | Missing | Renter home “Top matches” links to listings. Landlord applicants are incoming property interests, not open renter discovery. Need both modes and profile cards with photo/name/status/location/introduction/highlights/View Profile; landlord available-property count is allowed. |
| Inclusive practical recommendations (pp. 6–7) | Missing | No actual recommendation logic found. Match location, budget/cost, timing, duration, household/occupancy and lawful requirements; offer plain-English reasons. No numeric match/trust/risk scores, ARCS-based exclusion, secondary/wildcard groups or restricted open browsing. |
| Personalised person-to-person requests (p. 7) | Missing | `expressInterest` currently accepts property/renter identifiers, without a personalised note or person-based request. Need composer, optional property mention, visible-summary review and duplicate/pending handling. Do not relabel tenancy interests as full MVP requests. |
| Incoming/outgoing/accepted connections (pp. 7–8) | Incomplete foundation | Applicants and Matched screens list property-bound pending/matched interests; landlord can reciprocate or decline. Missing both-role incoming/outgoing lists, sender note/profile/evidence summary, Review Later and visible declined state. Current API intentionally hides recipient declines: incompatible with specified sender status. |
| Accepted success and messaging (pp. 7–8) | Missing | Both Matched detail screens are “Chat coming soon” placeholders. Need accepted-state check, “You’re Connected!”, clarification that this guarantees no viewing/property/reservation/tenancy, and conversation history/composer accessible only to accepted parties. |
| Spec navigation (p. 2) | Missing | Current renter: Home/Listings/Matched/My File/Profile; landlord: Home/Properties/Applicants/Matched/Profile. Target renter: Discover/Connections/Profile; landlord: Discover/Connections/Properties/Profile. Move ARCS/profile setup under Profile; nest incoming/outgoing/accepted under Connections; preserve useful dashboards as nested content if needed. |
| Visual language (p. 1) | Incomplete | Rounded cards/whitespace already exist. Palette is cream/rust/brown, duplicated in authentication/input screens. Need forest-green headings/buttons, sage cards/sections, small yellow accents and optional tiny outline doodles. Heart icons and dating-style match language need replacing as workflows migrate. No large competing illustrations. |
| User control/access safeguards (p. 8) | Missing | No account-deletion request, reporting/blocking, upload editing/deletion integration or proven file access controls. Await backend contract; use dummy evidence, approved privacy material and review fairness/DPIA requirements before real-user evidence collection. |

## Property field audit (pp. 5–6)

- Existing create/edit fields: full address line, city, postcode, monthly rent, bedrooms and basic smoking/pets/sharers rules. Display helpers support currency; create UI uses GBP.
- Description can be displayed from existing data but has no editor. Status uses draft/published/archived; confirm mapping to draft/available/unavailable with backend rather than inventing it.
- Missing: private nickname/reference; public area/postcode district and address visibility; deposit; bills; availability; minimum/expected duration; property type; bathrooms; maximum occupants; furnishing; multiple photos; video/live walkthrough; description/key features editor; council tax; EPC; HMO licence/details; registration details; heating/energy; parking/outdoor/accessibility; expanded lawful conditions; default/custom ARCS and profile preview.
- Do not expose an exact address by using it as a fallback public title. Await explicit public/private DTO fields. Require at least two complete synthetic properties for demo validation.

## Implementation order

### 1. Independent frontend foundation — begin now

1. Centralise semantic cream/forest/sage/yellow theme, spacing/radius tokens, navigation theme and header/tab styling. Apply to authentication and shared form/card/empty states. Use accessible contrast and clear disabled states.
2. Add reusable accessible button, neutral status badge and evidence selection controls; integrate into existing screens so these are exercised, not unused scaffolding.
3. Expand the developer-editable ARCS catalogue to all proposed options (16 A, 13 R, 14 C, 11 S); order strands A/R/C/S. Add multi-select/explanation draft interaction without claiming persistence. Keep optional uploads and existing pickers. Remove risk/confidence framing from ARCS summaries.
4. Record target navigation above, but defer replacing active backend-dependent discovery/connections screens until the contract is available. Shared navigation styling is independent and can ship immediately. Do not put a new Discover label over a property feed.

### 2. Backend contract handoff — required before API-dependent screens

Read backend-provided `API_CONTRACT.md` when available. Resolve these capabilities and data/privacy rules with that contract; these are requirements, **not proposed routes**:

- Authenticated role, editable role profiles, onboarding completion/resume, terms acceptance/versioning and private versus public profile fields.
- Verification provider or explicitly synthetic statuses; registration numbers/type and actual review submission/state; logout/account isolation.
- Configurable evidence IDs, per-strand multi-select/explanations/statuses, upload size/type limits, secure upload/read/remove flow and permitted summary DTOs. No document URLs in public profiles/requests.
- Landlord rank permutation, per-evidence Accept/Prefer/Not needed, defaults/property overrides and factual property constraints.
- Complete property DTOs, gallery/media, privacy/visibility, available/unavailable semantics and public landlord-profile embedding.
- Both-role people discovery, pagination/search/filtering, plain-language practical recommendation reasons and independent Explore All. Explicitly exclude evidence-preference ranking.
- Person-based requests: sender/recipient/note/optional mention, shared-summary review, incoming/outgoing/statuses, acceptance/decline/review-later semantics and idempotency. Confirm migration of existing property interests.
- Accepted-only conversation membership, message history/send/pagination/transport, retry ordering and server-side access checks.
- Blocking/reporting/account deletion and retention. Confirm errors, authentication, validation and synthetic demo seeding.

Keep existing API functions unchanged until migration is understood. Shared types must match the supplied contract; do not use casts or fabricated local success to cover missing capabilities.

### 3. Profiles and ARCS onboarding

Implement both ordered onboarding journeys with editable/resumable profiles, honest verification, personal prompts, approved privacy/terms, flexible evidence and safe public preview. Connect rank/evidence preference controls and property overrides. A renter can skip unsupported evidence types, add text without a file and choose multiple alternatives. Public views never expose private uploads.

### 4. People-first navigation/discovery and properties

Migrate to the specified role tabs. Add Suggested for You/Explore All for both roles, complete public profiles and practical explanation text. Nest renter property cards/detail solely under landlord profiles, with view-only property detail returning to the landlord. Preserve landlord creation/editing/publishing and expand contracted fields/media. Remove active renter property feed and property interest actions as their replacements become available.

### 5. Requests, acceptance and chat

Implement profile-only request entry, note composer and visible-summary review. Connections contains incoming/outgoing/accepted; recipient can accept/decline/review later and sender sees accurate status. Acceptance opens the success state and a real simple conversation. Verify pending/declined/blocked users cannot open/send messages through direct navigation or the server. Avoid hearts/swiping, approval guarantees and property applications.

### 6. Demo verification — 29 October 2026

Use synthetic accounts and dummy documents. Validate on iOS and Android, including keyboard, safe areas, long catalogues, larger text, back navigation, loading/errors/retries and session switches. Typecheck and bundle before device checks. Verify backend access controls with agreed test fixtures; local UI behaviour cannot prove private storage.

## Minimum demo checklist mapped to current state (p. 8)

| Official requirement | Current readiness | Demo acceptance |
| --- | --- | --- |
| Both roles sign up and edit profiles | Partial: signup only | Create both synthetic accounts; edit/reopen saved profiles. |
| Renter prompt and multiple ARCS pathways | Missing | Edit optional story; select multiple alternatives within each strand; skip types freely. |
| Attach/remove private safe demo files | Partial: local picker/removal | Attach/remove dummy files, reopen persisted evidence; other account sees only categories/status. |
| Landlord ranks ARCS and selects evidence | Missing | Reorder all four uniquely; change Accept/Prefer/Not needed; reopen defaults. |
| At least two properties with photos/details | Partial: basic CRUD | Create two complete synthetic properties, save galleries and preview in landlord profile. |
| Properties only inside landlord profiles | Fails: separate feed exists | Renter reaches view-only property details solely through landlord profile and returns there to connect. |
| Both see Suggested for You and Explore All | Missing | Switch modes for each role; open people beyond suggestions; reasons use practical fit. |
| Both open profiles and send personal requests | Missing | Each role initiates a person request with a note and sharing review. |
| Accept/decline; sender sees status | Partial: property interests differ | Recipient accepts/declines/reviews later; sender sees accurate state across reloads. |
| You’re Connected! and simple chat | Missing | Accept, show clarification, exchange messages from both accounts; pending parties denied. |
| Honest verification, privacy and terms | Partial: unverified placeholders | Clear synthetic/mock status; approved notices accessible; terms acceptance recorded as contracted. |

## First frontend pass tracking

Completed after writing this plan:

- Added semantic forest/cream/sage/yellow palette, spacing/radius tokens and navigation theme. Applied colours to shared cards/forms, login/signup, loading state and shared stack/tab styling. Replaced tab heart icons with conversation outlines without changing existing route names or API behaviour.
- Added reusable accessible `Button`, `StatusBadge` and checkbox `SelectionOption`; integrated into empty states and evidence screens. FormInput now preserves caller styles.
- Expanded `trustPillars.ts` to all 54 proposed choices (16 A / 13 R / 14 C / 11 S), in ARCS order. Evidence category now supports multi-select and optional explanatory text as an explicitly unsaved, screen-local draft; no save/request/storage endpoints were added. Existing device file pickers/removal remain available. These selections/explanations reset on closing the screen; file selection resets on closing the upload screen and is not attached to a saved draft.
- Replaced ARCS confidence/risk/suitability placeholder sections with neutral evidence-summary language. Summary is explicitly not a persisted public preview. Disabled the inactive evidence submission control even after picking a file; dummy-document guidance explains selection is not uploaded or saved.
- Updated authentication branding to Lérí, removed unsupported user-count/privacy assurances and unused large-illustration scaffold. Existing auth functionality and pre-existing working-tree changes were preserved.

Validation: baseline and changed TypeScript checks (`tsc --noEmit`) passed; `git diff --check` passed. Expo exported iOS and Android Hermes bundles successfully to `/private/tmp/leri-mvp-export`. These are static/bundling checks, not device, backend, privacy/access-control or complete demo verification. No demo checklist row is complete solely from this pass. The final role-tab migration and all new API-dependent screens remain awaiting `API_CONTRACT.md`.

## Architecture refactor and frontend layouts — 14 October 2026

This section supersedes the earlier decision to defer tab migration: the user explicitly authorised refactoring the current application and building unavailable frontend layouts before the backend contract arrives. The original inventory above records the baseline, not the current screen tree. See `SCREEN_MIGRATION_MAP.md` for the inspected old paths, callers, dependencies and migration actions.

### Completed frontend work

- Renter active tabs are **Discover | Connections | Profile**. Landlord active tabs are **Discover | Connections | Properties | Profile**. Both roles use the same Discover and Connections implementations. There are no active Home, Listings, Matched or Applicants stacks.
- Consolidated Home/Listings into shared Discover with Suggested for You / Explore All controls, practical compatibility copy and honest unavailable content. There is no active call to the renter property-feed API. Search/filter controls are disabled pending the people-discovery contract; no invented profile list is shown.
- Reused the existing public landlord screen and property cards inside its profile. Extended landlord public layout with bio, locations, experience, communication, approach, personal prompts and ARCS priorities. Existing landlord-profile API still supplies actual name/properties when an ID is available; unavailable fields stay explicitly unavailable. No fabricated people or recommendations.
- Reused the old Trust Profile screen as the single public renter layout, with story, preferences and safe ARCS summary sections. Both role editors reuse the public content components for unsaved previews, rather than maintaining alternative layouts.
- Reused renter property details as a view-only public property screen with **Back to landlord profile**. Removed its property-interest reads/mutations and ARCS compatibility breakdown. Property IDs must belong to the selected landlord. Public cards/details omit full address, full postcode and free-text content that lacks a contracted public/private boundary. Existing landlord-side full property management is retained.
- Consolidated Matched/Applicants into a single Connections implementation with Incoming / Outgoing / Accepted sections. New personalised requests are unavailable, not inferred from legacy records. Existing property interests remain accessible in a clearly identified section with real loading/empty/error/refresh behaviour; record review, existing landlord reciprocation and existing-interest decline actions are migrated into the shared review screen. No automatic conversion or migration of user records occurred.
- Added the genuinely new personalised note composer with optional property mention and draft/sharing review. Sending is disabled, and no endpoint or recipient-response format was invented. Either role can inspect the composer from the public profile layout; no saved-profile sharing preview is claimed.
- Extended the old chat placeholder into one conversation layout. Added the missing “You’re Connected!” confirmation layout, explicitly labelled as a preview with no created connection. Actual acceptance, conversation entry and sending remain disabled. No sample messages, accepted people or false success notifications are generated.
- Moved all renter evidence editing under Profile; retained multi-select/explanations and real file pickers/removal. Added an explicit return from the nested ARCS dashboard to Profile. Removed the obsolete separate summary route; public preview is the single replacement.
- Expanded the existing preferences editor into a shared `ProfileEditor` embedded in the existing renter/landlord account screens. Added all specified basic role fields, local photo choice/removal, renter story, landlord prompts/type/registration drafts, and safe unsaved public previews. Save is disabled. Existing account name/email/sign-out are retained; other saved fields are not falsely populated or overwritten.
- Added one shared `ArcsPreferences` editor used by landlord defaults and property customisation: unique ranks 1–4 with up/down controls, full catalogue and per-option Accept / Prefer / Not needed. Property preferences also provide default/custom selection and separate draft occupancy/date/duration controls. None are saved or used for ranking/filtering.
- Removed the false “submitted for manual review” interaction from landlord verification. Verification is explicitly unavailable; profile registration input is an unsaved draft. Preserved the existing property publish API and server-enforced verification gate. Local verification context and navigation drafts are isolated between accounts.
- Extended existing query-state and screen-container components for shared unavailable/loading/empty/error presentation and typography. Query results are scoped to their keys so switching profiles/records cannot show a previous person's data. Existing API client/endpoints and authentication requests were preserved.

### Still waiting for API_CONTRACT.md

| Screen/feature | Pending integration |
| --- | --- |
| Discover | Both-role people lists, suggestions/reasons, open browsing, search/filters, pagination and full profile IDs/data. |
| Public profiles | Full permitted renter/landlord fields, verified/demo photo/status, safe evidence categories/status, landlord priorities and public property fields/media. The existing landlord name/property query is retained. |
| Profile editors / renter ARCS | Read/save/resume, server validation, onboarding completion, configurable evidence IDs, private uploads and deletion. Local drafts reset when their editor closes; they are not shared or persisted. |
| Landlord ARCS / property preferences | Read/save defaults, property override inheritance, accepted evidence choices and factual constraints. Draft choices are not applied. |
| Request composer / Connections | Real recipient identity, saved sharing preview, personalised request submission, incoming/outgoing/status, accept/decline/review-later persistence and existing-interest migration policy. |
| Confirmation / Conversation | Actual accepted-state check, membership/access control, message history/send/transport and blocked/pending/declined denial. Preview routes do not unlock messaging. |
| Verification / privacy | Provider/registry checks or clearly marked synthetic status, approved terms/privacy content, recorded acceptance, blocking/reporting/deletion and secure storage. |
| Property CRUD | Expanded fields/media/public-private visibility and status mapping. Existing draft/create/edit/publish/archive functionality remains working against its existing API integration. |

The demo checklist remains incomplete end to end: navigation, forms and layouts are implemented; persistence, real person discovery, requests, private evidence and messaging have not been simulated. Device/backend/access-control testing remains required after integration.

### Refactor verification

- TypeScript passed with `--noEmit --noUnusedLocals --noUnusedParameters`.
- Source graph check passed: all 57 source modules reachable from bootstrap, all relative imports resolve, 32 route registrations have unique names, exact requested role tabs, no active renter property-feed calls, and no interest actions/private address fields in public property views.
- Query-hook smoke checks passed for initial loading, key changes hiding previous data, stale response rejection and failed new-key requests not retaining another record's data.
- iOS/Android Expo Hermes bundle exports passed; final output is `/private/tmp/leri-mvp-refactor-export`.
- These checks do not claim on-device or backend integration success. No user data was deleted or migrated, and no new API paths/payloads were added.


## Phase 1 contract integration — 14 October 2026

The Phase 1 contract is now available and the documented frontend operations are connected in the existing screen tree: own profile read/partial save (including personal prompts and explicit discoverability), saved public preview, opposite-role public profile lookup, server ARCS catalogue, legal document reads, terms acceptance, privacy acknowledgement, consent reads/grant/withdrawal, and read-only server verification statuses with demo labels. The existing local verification provider was renamed/expanded into the single account ProfileProvider; authentication and role navigation are preserved. Public landlord property cards use the corrected address-free response type.

See `FRONTEND_INTEGRATION_CHECKLIST.md` for operation mappings, changed files, validation and remaining blockers. Profile save/consent success states require actual successful server responses. ARCS/private uploads, landlord priority persistence, discovery, personalised connections/acceptance and chat are unsupported by Phase 1 and remain clearly unavailable. The configured backend refused the read-only availability check, so live persistence, access-control and device validation are still pending; the minimum demo checklist is not yet complete.

## Renter UI refinement — 14 October 2026

Refactored existing views only; no new screen, navigation route, endpoint or provider.

- Discover: clear heading, friendly introduction, Suggested for You / Explore All controls and one concise honest empty state. Removed developer profile-preview buttons and operational notes. No synthetic recommendations or property feed.
- Connections: equal-width Incoming / Outgoing / Accepted segmented row, one concise state for each section, no layout-preview buttons. Existing property enquiries remain collapsed by default; original fetching, refresh and detail routes preserved. Refresh errors remain visible even with cached records.
- Profile: existing avatar/portrait/name/role header, short intro, About Me and Housing Preferences overview cards, Edit Profile, personal-story editing and saved public preview. Existing ARCS and verification routes remain accessible.
- Editing: one existing ProfileEditor, with renter About Me / Housing Preferences / Personal Story views. All fields, household controls, discoverability, validation, dirty patches, server-confirmed save and explicit reload remain. Unsaved changes require save or explicit discard before returning. Settings does not unmount the editor or discard drafts.
- Settings: a sage/forest-green control within the existing account screen opens legal documents, privacy/optional consent, account email and logout. No separate screen or competing settings implementation. Legal timestamps are presented as readable publication dates; success still depends on real server responses.
- Preview: reuses the existing public renter content; private fields remain excluded and owner preview omits the connection-request action. Photo drafts remain explicitly local and separate from persisted portrait URLs.

Modified source files (complete list for this UI task):
`src/components/AccountProfileScreen.tsx`, `src/components/ProfileEditor.tsx`, `src/components/LegalPreferences.tsx`, `src/screens/discover/DiscoverScreen.tsx`, `src/screens/discover/RenterPublicProfileScreen.tsx`, `src/screens/connections/ConnectionsScreen.tsx`, `src/screens/renter/profile/RenterProfileScreen.tsx`, `src/screens/renter/profile/VerificationStatusScreen.tsx`.
Documentation updated: `MVP_IMPLEMENTATION_PLAN.md`, `SCREEN_MIGRATION_MAP.md`, `FRONTEND_INTEGRATION_CHECKLIST.md`. No files created, renamed or removed for this UI task. Existing working-tree changes predate this task and are not attributed to it.

Validation: TypeScript and lint pass; all six Phase 1 regression tests pass. iOS and Android Hermes bundle exports pass (`/private/tmp/leri-renter-ui-export`). Architecture audit confirms 60 reachable modules, 32 unique routes, correct role tabs and no private property fields or renter property feed. Existing scroll/keyboard/safe-area containers retained; navigation references checked statically. Actual simulator/Android interaction, keyboard scrolling, screen-reader/large-text checks and Profile edit/save/reload remain manually unverified. API-level success is not screen-level success. Phase 2 integration remains paused.

Manual check after restarting Expo: Discover shows the people-first empty state; Connections shows one three-part selector and collapsed earlier enquiries; Profile shows the overview and Settings. Edit Short bio in Personal Details / About Me, Save profile, wait for “Profile saved to your account.”, return to overview, edit Personal Story and save separately. Leave/reopen Profile, pull down to refresh the overview and reopen both edit sections to confirm values. Preview Public Profile must show saved public content without current location, account email or documents. Open Settings to verify legal/privacy/consent/logout access, and use My ARCS evidence / Verification status from Profile. Keep all tests on the dedicated synthetic renter.

## Final targeted renter cleanup — 14 October 2026

- Existing renter ProfileEditor now signals its current focused view to the existing account shell: overview avatar/menu/settings are hidden during editing/preview, and switching views resets scroll to the top. No new screens/routes/providers.
- Removed Reload saved profile from overview. Pull to refresh on the overview reloads the real provider; opening an editing section hydrates the latest server profile. Explicit reload remains secondary inside editing. Unsaved edits and patch validation remain unchanged.
- Profile biographies/story summaries omit UUIDs and known synthetic validation boilerplate through display-only formatting. Raw stored data and editable values are preserved; nothing is silently rewritten. Empty introductions use an honest placeholder.
- Existing interests are fetched using the preserved API and shown only when records exist. There is no legacy empty section. Pull to refresh/retry still works; actual records retain their existing detail route.
- Scroll containers explicitly avoid automatic content-inset adjustment under existing opaque stack headers; keyboard avoidance retained.
- The blue floating gear was observed in a simulator screenshot and identified as Expo's native development-menu button, not an app component. Restarted local Expo Go with `-EXDevMenuShowFloatingActionButton 0`, then opened `exp://127.0.0.1:8081?disableFab=1`; a subsequent loaded Discover screenshot confirms the gear is hidden; the sole app Settings entry remains in Profile. Other Expo Go installations need the same setting; no native dependency/config or production change.

Source files modified in this targeted task: `src/lib/profiles.ts`, `src/components/ProfileEditor.tsx`, `src/components/AccountProfileScreen.tsx`, `src/components/ScreenContainer.tsx`, `src/components/ListScreenContainer.tsx`, `src/screens/renter/profile/RenterProfileScreen.tsx`, `src/screens/discover/RenterPublicProfileScreen.tsx`, `src/screens/connections/ConnectionsScreen.tsx`. Also modified: `scripts/phase1.test.mjs`, this document. No new or removed files.

Checks: TypeScript and lint passed; seven Phase 1 tests passed including display-cleanup/data-preservation regression. iOS/Android Hermes exports passed to `/private/tmp/leri-targeted-ui-final-export`. Navigation/import audit passed (60 reachable modules, 32 unique registrations, correct tabs). Live existing-client sign-in/profile/save/reload/public-preview/catalogue passed against the isolated local backend, resaving identical bio/story values without replacing user content. Actual Profile-screen edit/save/reload, keyboard scrolling and Android interaction remain unverified. Phase 2 integration stays paused; unavailable capabilities remain unavailable.

## Phase A frontend integration — complete in source, awaiting review

The supplied API contract now supports discovery/public property browsing. Existing Discover uses real Suggested/Explore pages with safe people cards, server reasons and cursor continuation (including empty Suggested candidate pages). Existing public profiles display safe server ARCS summaries/priorities. Existing landlord profile loads its nested available-property list; the existing view-only property screen loads public details and signed gallery photos and retains Back to landlord profile. Query hook pagination is an opt-in extension of the existing hook, with stale-response/race protection and honest retry/refresh. Existing authentication, role tabs, Profile editing/saving, owner property management and private evidence editing are preserved. No scores, mock operational data, backend writes or duplicate screens.

Checks: TypeScript/lint, 11 regression tests, navigation/import audit and iOS/Android exports passed. Live read-only frontend client checks passed for both discovery modes, public profile/property/photo and private-field exclusion; the synthetic renter currently receives zero suggestions and 25 Explore landlord profiles over two pages each. Simulator inspection reached the existing signed-out login only. Actual authenticated UI interaction and landlord-role manual verification remain unverified. Full validation/12-file manifest: FRONTEND_INTEGRATION_CHECKLIST.md Phase A section.

STOP after Phase A for user review. Phase B request creation/lists/decisions and Phase C messaging remain untouched and unconnected; Phase D evidence/preference/owner-property expansion is still pending. Backend capability availability is not a claim that the frontend demo checklist is fully complete.

## Phase B frontend integration — 16 October 2026

Existing composer/list/detail/confirmation now use documented real person requests. Public profile buttons carry recipient IDs; composer reviews saved public sharing and sends only recipientId/introduction, handles errors/409/double submission and shows success after the server returns. Connections keeps Incoming/Outgoing/Accepted, status badges for pending/review-later/declined/accepted, pagination and refresh. Only actual recipients can decide outstanding requests. Legacy interests remain separate in the reused detail screen; no historic match grants acceptance. Accepted confirmation re-fetches/checks the real connection and displays no tenancy/reservation guarantee.

Messaging is visibly the next step but disabled; no Phase C client method or conversation entry added. Phase 1 profile saving, authentication, ARCS, existing landlord property CRUD and Phase A remain preserved.

TypeScript/lint, 16 regression tests, navigation/import audit and both platform exports passed. Real client validation passed using new synthetic sessions and genuine API requests/decisions in the isolated stack only. Simulator still displays signed-out login; authenticated UI interactions remain unverified. Exact file manifest, endpoints, local manual-test credential path and remaining scope are in FRONTEND_INTEGRATION_CHECKLIST.md. Stop here for Phase B review; do not begin Phase C.

## Phase B Section 8 review — 16 October 2026

Reviewed the complete original PDF and existing implementation: required pre-send public sharing review, exact prompt, person-only payload, recipient-only decisions, real-success confirmation, safe public summaries and no-tenancy guarantee already exist. No application code or architecture changes needed; messaging remains disabled.

Authenticated iOS Simulator validation now reached both role logins, renter Discover → landlord public profile → composer → personalised draft → saved public sharing review, both accounts' Accepted lists, landlord recipient note/public profile/ARCS summary, disabled messaging, declined Outgoing status and normal back/scroll navigation. This supersedes the prior signed-out-only simulator note, but does not complete fresh request/decision validation. All supplied opposite-role account pairs already have terminal accepted/declined requests; contract uniqueness prevents resending. Need unused synthetic pairs for fresh Send/Pending/Review Later/Accept/Decline and the acceptance confirmation. No request records reset/changed, no new accounts, no backend changes. Software keyboard, refresh, error and duplicate-send behavior remain manually unverified.

TypeScript/lint, 16 regression tests, navigation/import audit and iOS/Android exports passed again (`/private/tmp/leri-phase-b-review-export`). Only this document and FRONTEND_INTEGRATION_CHECKLIST.md changed for the review; the latter contains the requirement-by-requirement evidence and limitations. Phase C remains paused.

## Fresh authenticated Phase B validation — completed 16 October 2026

The user authorized ordinary signup/profile setup for clearly synthetic unused accounts. Created one new demo landlord and three new renters in the existing isolated stack, without SQL, resets, migrations, backend/configuration changes or touching prior records. Exact account/request identities and UI/API evidence are in FRONTEND_INTEGRATION_CHECKLIST.md's final section; credentials remain private outside the repository.

- Full primary journey passed in the iOS Simulator: real renter login → Discover → full landlord profile → personalised composer → public sharing review → Send → genuine success/Pending Outgoing → landlord login/Incoming/public sender review → Accept → You're Connected! with disabled messaging. Both accounts showed Accepted after reopening/refresh.
- Separate Decline and Review Later requests were prepared through the documented API. Both recipient decisions and both resulting sender/recipient statuses were then verified in authenticated Simulator screens. No sender decision controls; Review Later stays outstanding and does not enable chat.
- Rapid double Send produced one request; a deliberate repeat for the accepted pair displayed the real 409 error without false success or replacing the existing record. Software keyboard, scrolling through the sharing review/public details, refresh and back navigation were exercised.
- Fixed the sole observed copy inconsistency in the existing ConnectionDetailScreen: sender accepted heading now says You're Connected! and its clarification explicitly includes property. Verified the revised copy in Simulator. No new screens, routes, components, client methods or authentication changes.
- After that fix, TypeScript/lint, all 16 regression tests, navigation/import audit (60 modules, 32 unique routes), whitespace check and iOS/Android exports passed (`/private/tmp/leri-phase-b-fresh-final-export`). Independent real-API checks confirm all final states, single requests, safe projections, sender 403 and duplicate 409; these results are separate from UI evidence.

Exactly three existing repository files changed: `src/screens/connections/ConnectionDetailScreen.tsx`, `FRONTEND_INTEGRATION_CHECKLIST.md`, this document. Uploaded-evidence fixtures, optional property mention, offline recovery and interactive Android/accessibility checks were not exercised; no complete-MVP claim. The earlier unused-pair/manual-request blocker is resolved. Phase C remains paused pending explicit approval.

## Phase C direct Accepted entry and basic conversation — 16 October 2026

User authorized integration of the messaging UX into the existing Connections/Conversation architecture. Accepted rows show public name/photo (initial fallback), and the whole row opens Conversation directly. Incoming/Outgoing still open request details. The existing You're Connected! screen remains at acceptance and offers entry into the same conversation; routine chat does not revisit it. No Messages tab or duplicate screen/route/component file.

Existing Conversation now checks real accepted membership and uses documented GET/POST `/connections/:id/messages`, with chronological string-cursor pagination, focus/manual refresh, honest empty/loading/error states and server-confirmed sends. Draft/confirmed-message state is isolated by account and connection. No real-time claim or automatic POST retry. A localized explicit Conversation-header back handler fixed stale content observed during Simulator navigation.

Authenticated iOS tests passed for both roles: Accepted-name tap → Conversation directly; renter UI send → landlord UI read/reply; back to Accepted → direct reopen with persisted history. Initial-avatar fallback verified; remote-photo rendering not manually exercised. Independent APIs confirm exactly two messages from the two participants and correct cursor continuation; declined/review-later history denied (409), outsiders denied (404). Same isolated Phase B pair used, no new requests/accounts/backend/configuration changes.

TypeScript/lint, 19 regression tests, navigation/import audit (60 modules/32 unique routes), whitespace and iOS/Android exports pass (`/private/tmp/leri-phase-c-final-export`). Full 12-file manifest and exact UI/API limitations are in FRONTEND_INTEGRATION_CHECKLIST.md. Long-history UI, remote photos, interrupted sends, interactive Android and accessibility remain unverified. Phase D and optional messaging capabilities are unchanged.
