import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { TenancyInterestStatus } from '../lib/mutualInterest';

export type Applicant = {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  compatibilityPercent: number;
  appliedAt: string; // ISO date
  status: TenancyInterestStatus;
};

// No tenancy_interests API exists yet, so this starts empty rather than
// showing sample rows.
const INITIAL_APPLICANTS: Applicant[] = [];

type LandlordApplicantsValue = {
  applicants: Applicant[];
  // Landlord's side of the mutual flow. Both actions map to
  // POST /tenancy-interests once that endpoint exists — expressing
  // interest back at an applicant who already expressed interest in the
  // property is what turns the row 'matched' (both sides interested);
  // there's no separate accept/shortlist step.
  expressInterest: (id: string) => void;
  // Maps to POST /tenancy-interests/:id/decline. Declining is quiet by
  // design — this only ever removes the row from the active/pending list,
  // never surfaces "declined" styling anywhere (see mutualInterest.ts).
  decline: (id: string) => void;
};

const LandlordApplicantsContext = createContext<LandlordApplicantsValue | null>(null);

// Shared via context (rather than per-screen local state) so
// ApplicantsListScreen, ApplicantDetailScreen, and the landlord's Matched
// tab all agree on the same data — same pattern as LandlordVerificationProvider.
export function LandlordApplicantsProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>(INITIAL_APPLICANTS);

  function setStatus(id: string, status: TenancyInterestStatus) {
    setApplicants((current) => current.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const value = useMemo<LandlordApplicantsValue>(
    () => ({
      applicants,
      expressInterest: (id) => setStatus(id, 'matched'),
      decline: (id) => setStatus(id, 'declined'),
    }),
    [applicants],
  );

  return (
    <LandlordApplicantsContext.Provider value={value}>
      {children}
    </LandlordApplicantsContext.Provider>
  );
}

export function useLandlordApplicants() {
  const context = useContext(LandlordApplicantsContext);
  if (!context) {
    throw new Error('useLandlordApplicants must be used inside LandlordApplicantsProvider');
  }
  return context;
}
