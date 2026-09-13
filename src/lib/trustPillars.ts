import type { Ionicons } from '@expo/vector-icons';

// Matches the TrustPillar union already defined server-side
// (ile-api/src/evidence/evidence.service.ts) and in @yourorg/ile-shared-types.
export type TrustPillar = 'community' | 'affordability' | 'reliability' | 'stability';

export const TRUST_PILLARS: readonly {
  id: TrustPillar;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'community',
    label: 'Community',
    description: 'References and ties to the local area.',
    icon: 'people-outline',
  },
  {
    id: 'affordability',
    label: 'Affordability',
    description: 'Income and ability to sustain rent.',
    icon: 'cash-outline',
  },
  {
    id: 'reliability',
    label: 'Reliability',
    description: 'Payment and tenancy track record.',
    icon: 'checkmark-done-outline',
  },
  {
    id: 'stability',
    label: 'Stability',
    description: 'Employment and housing continuity.',
    icon: 'shield-checkmark-outline',
  },
];

// Pathway types a renter can submit evidence against, per pillar. The
// server's pathwayType field is free-text (see evidence.controller.ts), so
// this is the app's own suggested list rather than something fetched.
export const EVIDENCE_PATHWAYS: Record<TrustPillar, readonly string[]> = {
  community: ['Reference letter', 'Community group membership', 'Local volunteering record'],
  affordability: ['Payslips', 'Bank statements', 'Employer letter'],
  reliability: ['Previous landlord reference', 'Rent payment history'],
  stability: ['Employment contract', 'Tenancy history'],
};
