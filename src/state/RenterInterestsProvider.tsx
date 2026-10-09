import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { TenancyInterestStatus } from '../lib/mutualInterest';

export type RenterInterest = {
  propertyId: string;
  status: TenancyInterestStatus;
};

type RenterInterestsValue = {
  interests: RenterInterest[];
  getInterestForProperty: (propertyId: string) => RenterInterest | undefined;
  // Maps to POST /tenancy-interests once that endpoint exists. Renter's
  // side of the mutual flow: expressing interest in a property. If the
  // landlord already expressed interest back (not modelable locally yet —
  // there's no landlord-initiated interest concept on this stub), the real
  // endpoint is what would return 'matched' immediately instead of 'pending'.
  expressInterest: (propertyId: string) => void;
};

const RenterInterestsContext = createContext<RenterInterestsValue | null>(null);

// No tenancy_interests API exists yet (see mutualInterest.ts), so this is
// in-memory only — same pattern as LandlordVerificationProvider. Shared via
// context (rather than per-screen local state) so PropertyDetailScreen and
// the renter's Matched tab agree on the same data.
export function RenterInterestsProvider({ children }: { children: ReactNode }) {
  const [interests, setInterests] = useState<RenterInterest[]>([]);

  const value = useMemo<RenterInterestsValue>(
    () => ({
      interests,
      getInterestForProperty: (propertyId) =>
        interests.find((i) => i.propertyId === propertyId),
      expressInterest: (propertyId) => {
        setInterests((current) => {
          if (current.some((i) => i.propertyId === propertyId)) {
            return current;
          }
          return [...current, { propertyId, status: 'pending' }];
        });
      },
    }),
    [interests],
  );

  return (
    <RenterInterestsContext.Provider value={value}>{children}</RenterInterestsContext.Provider>
  );
}

export function useRenterInterests() {
  const context = useContext(RenterInterestsContext);
  if (!context) {
    throw new Error('useRenterInterests must be used inside RenterInterestsProvider');
  }
  return context;
}
