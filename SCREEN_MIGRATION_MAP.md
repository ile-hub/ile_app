# Lérí screen migration map

Written before the refactor, 14 October 2026. References inspected across `src`, `App.tsx`, `index.ts`, configuration and scripts. Paths in this table are the original paths. No backend contract is present. New layouts use unavailable states, not synthetic people or invented API DTOs.

| Existing path | Current → MVP responsibility | Action / destination | Navigation references | Preserve |
| --- | --- | --- | --- | --- |
| `src/screens/renter/RenterHomeScreen.tsx` | Dashboard → both-role people discovery | Rename → `src/screens/discover/DiscoverScreen.tsx` | RenterHomeStack → shared DiscoverStack | Greeting, Card, empty/query states |
| `src/screens/landlord/LandlordHomeScreen.tsx` | Dashboard → shared discovery | Merge into Discover; remove old file | LandlordHomeStack | Verification access in Profile; property management in Properties; interests in Connections |
| `src/screens/renter/listings/ListingsScreen.tsx` | Standalone property feed → profile browsing | Merge into Discover; remove forbidden feed | RenterListingsStack | Virtualised list pattern; property cards inside landlord profile |
| `src/navigation/renter/RenterListingsStack.tsx` | Listings/profile/property stack → Discover stack | Rename → `src/navigation/DiscoverStack.tsx` | RenterTabNavigator; add landlord tab | Landlord/profile/property routes, stack styling |
| `src/navigation/{renter/RenterHomeStack,landlord/LandlordHomeStack}.tsx` | Separate home stacks → shared Discover | Merge / remove | Role tab navigators | Shared root Discover route |
| `src/screens/renter/listings/LandlordProfileScreen.tsx` | Public landlord/property list → full public layout | Rename → `src/screens/discover/LandlordProfileScreen.tsx` | DiscoverStack, property return | Existing landlord API, 404 handling, property cards; hide private addresses |
| `src/screens/renter/listings/PropertyDetailScreen.tsx` | Property detail and interest actions → view-only detail | Rename → `src/screens/discover/PropertyDetailScreen.tsx` | DiscoverStack, landlord profile only | Property query/retry/rent/rules; explicit back action; remove property application calls |
| `src/screens/renter/matched/MatchedListScreen.tsx` | Matched list → both-role Connections | Rename → `src/screens/connections/ConnectionsScreen.tsx` | Shared ConnectionsStack | Existing interest queries, loading/errors/refresh; distinguish legacy data from new requests |
| `src/screens/landlord/{matched/MatchedListScreen,applicants/ApplicantsListScreen}.tsx` | Separate accepted/applicant queues → one Connections | Merge / remove | Old matched/applicant stacks | Pending/matched records and recipient actions migrated into shared list/detail |
| `src/screens/landlord/applicants/ApplicantDetailScreen.tsx` | Property applicant review → connection review | Rename → `src/screens/connections/ConnectionDetailScreen.tsx` | Shared ConnectionsStack | Existing getInterest/reciprocate/decline; explicitly labelled existing property-interest actions |
| `src/screens/renter/matched/MatchedDetailScreen.tsx` | Chat placeholder → conversation layout | Rename → `src/screens/connections/ConversationScreen.tsx` | Shared ConnectionsStack | No fake messages; disabled sending until contract |
| `src/screens/landlord/matched/MatchedDetailScreen.tsx` | Duplicate chat placeholder → shared conversation | Merge / remove | LandlordMatchedStack | Shared unavailable conversation state |
| `src/navigation/renter/RenterMatchedStack.tsx` | Matched stack → shared Connections | Rename → `src/navigation/ConnectionsStack.tsx` | Both role tabs | Single list/detail/conversation route registration |
| `src/navigation/landlord/{LandlordMatchedStack,LandlordApplicantsStack}.tsx` | Duplicate connection stacks → shared Connections | Merge / remove | LandlordTabNavigator | One Connections tab |
| `src/navigation/{renter/RenterTabNavigator,landlord/LandlordTabNavigator}.tsx` | Five tabs → 3 renter / 4 landlord tabs | Refactor | RootNavigator | Role/auth separation; landlord Properties |
| `src/navigation/renter/RenterFileStack.tsx` | My File tab → nested Profile evidence | Keep / refactor as nested route | RenterProfileStack | All evidence dashboard/category/upload/summary routes |
| `src/screens/renter/file/{EvidenceDashboardScreen,EvidenceCategoryScreen,EvidenceUploadScreen}.tsx` | Evidence editing → Profile ARCS | Keep / refactor | Nested RenterFileStack | Full catalogue, multi-select, explanation, real device pickers/removal, no upload claims |
| `src/screens/renter/file/TrustProfileScreen.tsx` | Evidence summary → safe renter public preview | Rename → `src/screens/discover/RenterPublicProfileScreen.tsx` | Profile preview and DiscoverStack | Neutral category/status summary; no documents in public view |
| `src/screens/renter/profile/PreferencesScreen.tsx` | Local budget/household editor → shared role editor | Rename → `src/components/ProfileEditor.tsx` | Embedded in both existing account screens | Existing input fields; add missing profile/prompt fields, disabled save |
| `src/screens/{renter/profile/RenterProfileScreen,landlord/profile/LandlordProfileScreen}.tsx` | Account menus → editable role profiles | Refactor existing screens | Existing profile stacks | Account details/sign-out/verification; add preview/ARCS |
| `src/components/AccountProfileScreen.tsx` | Shared account shell → shell with editor content | Refactor | Both role profiles | Sign-out/error and menu behaviour |
| `src/navigation/{renter/RenterProfileStack,landlord/LandlordProfileStack}.tsx` | Account routes → profile/edit/evidence/preview | Refactor | Role Profile tab | Verification; no duplicate preferences editor |
| `src/screens/landlord/properties/{PropertiesListScreen,PropertyDetailScreen,AddEditPropertyScreen}.tsx` | Property CRUD → property CRUD | Keep | LandlordPropertiesStack | Existing endpoints, validation, draft/publish/archive and server verification gate |
| `src/screens/landlord/properties/PropertyPreferencesScreen.tsx` | Local household/duration → default/custom ARCS editor | Refactor | LandlordPropertiesStack | Separate factual occupancy/duration from evidence choices |
| `src/screens/{renter/profile/VerificationStatusScreen,landlord/profile/LandlordVerificationScreen}.tsx` | Verification placeholders → honest unavailable states | Keep / refactor | Profile stacks | No invented KYC/registry checks or false review submission |
| `src/components/{Button,Card,FormInput,SelectionOption,StatusBadge,EmptyState,QueryState,ScreenContainer,ListScreenContainer}.tsx` | Shared UI → shared UI | Keep / extend QueryState | All retained screens | Existing theme, keyboard/safe area and accessible controls |
| `src/lib/*`, `src/auth/*`, `src/theme/*`, `App.tsx`, `index.ts` | API/auth/types/theme/bootstrap | Keep; account-isolate local state | Root and retained consumers | No endpoint/payload changes; no user-data mutation/deletion |
| `src/screens/{LoginScreen,SignupScreen}.tsx`, app/config/scripts/assets | Authentication and bootstrap | Keep | RootNavigator | Existing auth and Expo 57 configuration |

Genuinely new responsibilities: personalised request composer (no equivalent exists), connection success layout (no equivalent exists), and shared landlord ARCS priority control (reused in defaults/property preferences). Any new presentation types describe component props only; they are not backend response formats. Old files are removed only after caller migration and a reference scan. API client functions stay intact even where an obsolete screen no longer calls them.

## Implemented result

The ten named renames above are complete. Nine obsolete files were removed after an import-resolution scan confirmed no retained module imported them: both Home stacks, landlord Home screen, renter Listings screen, landlord Applicants/Matched stacks and their duplicate list/chat screens. Useful interest queries/actions were migrated to the shared Connections list/review; property management and auth APIs were retained.

`TrustProfile` is no longer a separate evidence route. Its safe preview responsibility moved to `RenterPublicProfileScreen`, which is also reused inline by the existing profile editor. Landlord Profile's saved public-profile menu navigates to the single public landlord route in Discover; it does not register a second copy in Profile. Public property details use the distinct `PublicPropertyDetail` route, while landlord owner property editing retains `PropertyDetail`.

New source files are limited to `src/components/ArcsPreferences.tsx` (one control shared by default/property editors), `src/screens/connections/RequestConnectScreen.tsx` (missing personalised composer) and `src/screens/connections/ConnectedScreen.tsx` (missing confirmation layout). All other added source paths are moves/refactors of existing files. `QueryState.tsx`, `ScreenContainer.tsx`, `AccountProfileScreen.tsx`, `FormInput.tsx`, `Card.tsx`, `Button.tsx`, `SelectionOption.tsx`, `StatusBadge.tsx` and list containers are reused, rather than duplicated.

Additional cleanup: removed the unreferenced `getHomeRoute` helper whose old route names no longer exist, and removed unused local registration submission fields from the verification context. No existing API client functions were removed; obsolete property-feed functions remain dormant until the backend contract defines migration.

### Existing files modified in this refactor (in addition to the ten moves)

- Navigation: `src/navigation/RootNavigator.tsx`, both role `*TabNavigator.tsx` and `*ProfileStack.tsx` files, and `src/navigation/renter/RenterFileStack.tsx`.
- Shared UI: `src/components/AccountProfileScreen.tsx`, `src/components/QueryState.tsx`, `src/components/ScreenContainer.tsx`.
- Existing role screens: `src/screens/renter/profile/RenterProfileScreen.tsx`, `src/screens/landlord/profile/LandlordProfileScreen.tsx`, `src/screens/landlord/profile/LandlordVerificationScreen.tsx`, `src/screens/landlord/properties/PropertyPreferencesScreen.tsx`, `src/screens/renter/file/EvidenceDashboardScreen.tsx`, `src/screens/renter/file/EvidenceUploadScreen.tsx`.
- Supporting code: `src/lib/useApiQuery.ts`, `src/lib/auth.ts`, `src/auth/LandlordVerificationProvider.tsx`.
- Documentation: `MVP_IMPLEMENTATION_PLAN.md` updated; this migration map added. Earlier working-tree changes and staged deletions predate this refactor and were not reverted or attributed to it.

Validation completed: TypeScript with unused checks, iOS and Android Hermes exports, import/reachability/unique-route audit, query loading/key-isolation/error smoke checks and whitespace checks. No on-device or live backend verification is claimed.

## Renter presentation refinement

The existing AccountProfileScreen now provides an opt-in focused renter overview/settings area; landlord behavior retains its existing form. Existing ProfileEditor provides focused renter sections and owner preview internally, without registering another screen or route. Discover/Connections remove developer-only entry points; underlying public/detail/conversation routes are preserved for future documented integration and existing property enquiries. No file moves, new files, removed files or navigation registrations in this refinement. See MVP_IMPLEMENTATION_PLAN.md for the complete modified-file list and validation scope.

## Phase A integration (no screen migration or new routes)

| Existing file | Responsibility after Phase A | Action | Navigation/dependencies preserved |
| --- | --- | --- | --- |
| `src/screens/discover/DiscoverScreen.tsx` | Real both-role people discovery and pagination | Refactor | Existing DiscoverStack and both role tabs; Card/Button/ListScreenContainer/verification/query/client |
| `src/screens/discover/LandlordProfileScreen.tsx` | Safe profile, actual public ARCS priorities, nested public property cards | Refactor | Same LandlordProfile route; PublicPropertyDetail with landlord/property IDs; reusable saved-preview content |
| `src/screens/discover/RenterPublicProfileScreen.tsx` | Safe public story/preferences and server evidence-category/status summaries | Refactor | Same RenterPublicProfile route and reusable saved-preview content; no private documents/explanations |
| `src/screens/discover/PropertyDetailScreen.tsx` | Nested public detail/gallery, actual signed photo links and explicit return | Refactor | Same PublicPropertyDetail route, Back to landlord profile; no property-interest mutation |
| `src/lib/{api,phase1Types,profiles,useApiQuery}.ts` | Existing typed transport, public DTOs, page merge and optional pagination | Extend | Existing Supabase session/error handling and non-paginated consumers; no parallel query architecture |

No new/removed files, screen registrations or navigation changes. Connections/composer/chat remain as before Phase A, awaiting review and later phases. Full changed-file/test manifest: FRONTEND_INTEGRATION_CHECKLIST.md.

## Phase B integration — existing screens/routes extended

| Existing file | New responsibility / action | Preserved dependencies |
| --- | --- | --- |
| `src/screens/connections/RequestConnectScreen.tsx` | Refactor draft composer into real person request with saved sharing review and server-confirmed inline success | Existing DiscoverStack RequestConnect route, public preview components, theme/forms/API session |
| `src/screens/connections/ConnectionsScreen.tsx` | Refactor into paginated real Incoming/Outgoing/Accepted lists with all contracted states | Single ConnectionsStack; existing query/list components and separately accessible legacy interests |
| `src/screens/connections/ConnectionDetailScreen.tsx` | Refactor into real note/public profile/status/recipient decisions; keep legacy interest detail as a separate local branch | Existing detail route, legacy get/reciprocate/decline operations; no duplicate screen |
| `src/screens/connections/ConnectedScreen.tsx` | Replace layout preview with actual accepted-state/participant confirmation | Existing Connected route; no active Conversation navigation until Phase C |
| `src/navigation/{DiscoverStack,ConnectionsStack}.tsx` | Extend existing params with actual recipient/connection identities; distinguish legacy IDs | Same route registrations and role tabs |
| Existing public renter/landlord screens | Pass recipient IDs; hide own-role/request-review duplicate actions | Existing profiles, public summaries, nested property gallery and saved previews |
| Existing API/types/profile helpers and test script | Extend contract DTOs/transport, permission/status/note/page helpers and regression tests | Same auth/provider/query architecture; no backend modification |

No file moves/removals/new screens or routes. All 32 route registrations remain unique. Full Phase B file manifest and validation scope: FRONTEND_INTEGRATION_CHECKLIST.md.

## Phase C — reuse existing conversation and Connections navigation

| Existing file | Action / current responsibility | Preserved dependencies |
| --- | --- | --- |
| `src/screens/connections/ConnectionsScreen.tsx` | Refactor Accepted rows into direct chat entry with public name/photo/fallback | Same Incoming/Outgoing/detail/decision/legacy flows; no Messages tab |
| `src/screens/connections/ConversationScreen.tsx` | Integrate existing placeholder with real accepted-member history/send/refresh/pagination | Existing form/card/container/theme/client/auth; one screen implementation |
| `src/navigation/ConnectionsStack.tsx` | Extend Conversation params to `{ connectionId: string }`; explicit existing-header back handler | Same four route registrations and role Connections tabs |
| `src/screens/connections/ConnectedScreen.tsx` | Preserve genuine acceptance confirmation, enable Start conversation into existing route | Actual accepted participant check and no-tenancy guarantee |
| `src/screens/connections/ConnectionDetailScreen.tsx` | Preserve request decisions; accepted detail directs people to Accepted for chat | Existing legacy branch, public summaries and server-confirmed status |
| Existing API/types/profile helpers and regression script | Extend documented message transport/types, eligibility and cursor merge | Same session/error/query architecture; no backend or package changes |

No screen/component files created, renamed, merged or removed; 60 reachable modules and 32 distinct routes remain. Authenticated iOS direct-entry validation and full file manifest are in FRONTEND_INTEGRATION_CHECKLIST.md's Phase C section.
