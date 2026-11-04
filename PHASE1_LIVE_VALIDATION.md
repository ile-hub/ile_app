# Phase 1 local connectivity and live validation

Validated 14 October 2026 using the confirmed ile-api handoff and dedicated synthetic renter. No Phase 2 frontend integration was started.

## Configuration

- Updated only git-ignored `.env.local` for iOS Simulator: NestJS `http://localhost:3000`, no global API prefix; Supabase Auth `http://localhost:55321`.
- Retrieved the public anon key directly from `supabase status` for `/private/tmp/leri-supabase-phase2-20261014-final`, verified project ID `leri-phase2-validation-20261014-final`, API port 55321 and key role `anon`. No service-role key or password was placed in an `EXPO_PUBLIC_` variable. Keys/tokens are omitted from this report.
- Left `.env`, the original database/stack on 54321/54322, production settings, existing screens, navigation, authentication and API client unchanged.
- Restarted Expo with the local override and a cleared Metro cache. Metro initially bound only IPv6 localhost; Expo Go requested its bundle through IPv4. Restarting the development server with LAN binding made its IPv4 bundle URL reachable. This was a Metro issue, separate from NestJS/Supabase connectivity.
- Android Emulator will require `10.0.2.2` for both local service URLs. Physical devices require a verified Mac LAN address and reachability to both ports. Neither platform was tested or reconfigured in this pass.

## Real API/client checks

Used the existing `src/lib/api.ts` request methods with a real Supabase sign-in/session and real HTTP responses. The temporary Node test adapter used memory session storage instead of native SecureStore/AppState; it did not mock any server responses or inject a successful session. Credentials came from the git-ignored ile-api handoff file and were not printed.

| Check | Result |
| --- | --- |
| Confirmed environment loaded using Expo's environment loader | PASS: API 3000, isolated Auth 55321 |
| `GET /health` | PASS: HTTP 200, status ok, db ok |
| `GET /legal/documents` | PASS: HTTP 200, terms and privacy notice present |
| Unauthenticated `GET /me` | PASS: HTTP 401 |
| Dedicated synthetic renter sign-in | PASS: real Supabase session |
| Authenticated account and own profile | PASS: server role renter; profile identity matches authenticated account |
| Save bio and personal story through existing API client | PASS: PATCH response confirmed both edited values |
| Reload own profile | PASS: subsequent GET returned the saved bio and personal story |
| Saved public preview | PASS: same stored bio/story; checked private fields, document payload/reference fields and owner current location were absent |
| ARCS catalogue | PASS: 54 unique options; A 16 / R 13 / C 14 / S 11 |

Only the dedicated synthetic renter's bio and personal story were edited, using clearly synthetic test text. The validated isolated project was the only authentication/database target. No migrations or database resets were run.

## Actual simulator UI check and remaining gate

- PASS: installed iPhone 17 Pro / iOS 26.5 simulator boots; Expo Go loads the real existing Lérí login screen from Metro with the new environment.
- BLOCKED / NOT VERIFIED: sign-in and bio/story editing via the actual Profile screen. Coordinate/keyboard automation did not reliably enter the intended fields, and the development runtime connection was unavailable. The unfinished login attempt was reset. There is no evidence here of a Profile-screen persistence failure; that UI path simply has not been verified.
- No mock success, alternate screen or testing-only authentication architecture was added. API-level success is not reported as a completed UI test.
- Next step: complete sign-in, Profile edit/save/reload, saved public preview and catalogue navigation manually in the running simulator, or with working device automation. Continue using the dedicated isolated synthetic account.
- Phase 2 frontend integration remains paused until that requested Profile-screen persistence check succeeds. Android/physical-device checks also remain pending.
