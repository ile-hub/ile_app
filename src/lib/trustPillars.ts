import { api } from './api';
import { useApiQuery } from './useApiQuery';
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
    id: 'affordability',
    label: 'Affordability',
    description: 'How can you demonstrate capacity to pay?',
    icon: 'cash-outline',
  },
  {
    id: 'reliability',
    label: 'Reliability',
    description: 'What can show responsible tenancy behaviour?',
    icon: 'checkmark-done-outline',
  },
  {
    id: 'community',
    label: 'Community',
    description: 'How will you fit the household and communicate?',
    icon: 'people-outline',
  },
  {
    id: 'stability',
    label: 'Stability',
    description: 'What makes the proposed tenancy workable?',
    icon: 'shield-checkmark-outline',
  },
];

// The server catalogue is authoritative; never silently fall back to stale local choices.
export function useEvidenceCatalogue() {
  return useApiQuery('evidence/catalogue', async () =>
    (await api.evidenceCatalogue()).sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label)));
}
