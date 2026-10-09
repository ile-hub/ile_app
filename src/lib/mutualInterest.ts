// Shared status vocabulary for the mutual-interest flow. There are exactly
// three states, no "shortlisted"/intermediate step: a renter or landlord
// expresses interest (pending until the other side responds), the other
// side either matches it (both interested — status becomes 'matched') or
// declines it. Declining is quiet by design: it never surfaces "why" or
// "who" anywhere in the UI, it just stops showing up in the active list.
//
// NOTE: this shape is a local placeholder for building the UI against —
// it is NOT confirmed against a real API. Nothing under `tenancy_interests`
// exists yet in ile-api (no migration, no controller) — see endpoint.md's
// `applications` design there instead, which is a different, older shape.
// Swap the stub calls in RenterInterestsProvider / LandlordApplicantsProvider
// for real requests once that's built, using whatever shape it actually
// returns.
export type TenancyInterestStatus = 'pending' | 'matched' | 'declined';
