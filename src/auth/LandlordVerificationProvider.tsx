import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// Identity/landlord-registration status. Per the MVP decision there's no
// automated LRS lookup yet — submitting a registration number just moves
// this to "pending" for manual review. There's no backend for it either,
// so this lives in memory only (resets on app reload/logout) and is
// wired up wherever a screen needs to read or gate on it: the Home nudge,
// AddEditPropertyScreen's publish gate, and LandlordVerificationScreen.
export type LandlordVerificationStatus = 'unverified' | 'pending' | 'verified';

type LandlordVerificationValue = {
  status: LandlordVerificationStatus;
  registrationNumber: string | null;
  submitRegistrationNumber: (value: string) => void;
};

const LandlordVerificationContext = createContext<LandlordVerificationValue | null>(null);

export function LandlordVerificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LandlordVerificationStatus>('unverified');
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);

  const value = useMemo<LandlordVerificationValue>(
    () => ({
      status,
      registrationNumber,
      submitRegistrationNumber: (nextValue: string) => {
        setRegistrationNumber(nextValue);
        setStatus('pending');
      },
    }),
    [status, registrationNumber],
  );

  return (
    <LandlordVerificationContext.Provider value={value}>
      {children}
    </LandlordVerificationContext.Provider>
  );
}

export function useLandlordVerification() {
  const context = useContext(LandlordVerificationContext);
  if (!context) {
    throw new Error('useLandlordVerification must be used inside LandlordVerificationProvider');
  }
  return context;
}
