import type { Connection, ConnectionPage, ConnectionFilter, DiscoveryPage, MessagePage, OwnProfile, RenterProfileUpdate, LandlordProfileUpdate } from './phase1Types';

type TextField = 'displayName' | 'bio' | 'photoUrl' | 'currentLocation' | 'preferredLocation' | 'targetMoveDate' | 'personalStory' |
  'companyName' | 'communicationStyle' | 'lettingApproach' | 'tenantExpectations' | 'tenancySuccess' | 'registrationDetails';
type NumberField = 'budgetMin' | 'budgetMax' | 'tenancyLengthMonths' | 'householdSize' | 'lettingExperienceYears' | 'numberOfProperties';
type ArrayField = 'locationsCovered' | 'registrationNumbers';
export type ProfileField = { key: TextField | NumberField | ArrayField; label: string; maxLength?: number; numeric?: boolean; multiline?: boolean };
const base: ProfileField[] = [
  { key: 'displayName', label: 'Display name', maxLength: 100 },
  { key: 'bio', label: 'Short bio', maxLength: 2000, multiline: true },
  { key: 'photoUrl', label: 'Public portrait HTTPS URL (optional)', maxLength: 2048 },
];
const renter: ProfileField[] = [
  { key: 'currentLocation', label: 'Current location (private)', maxLength: 100 },
  { key: 'preferredLocation', label: 'Preferred location', maxLength: 100 },
  { key: 'budgetMin', label: 'Minimum monthly budget (£)', numeric: true },
  { key: 'budgetMax', label: 'Maximum monthly budget (£)', numeric: true },
  { key: 'targetMoveDate', label: 'Target move date (YYYY-MM-DD)', maxLength: 10 },
  { key: 'tenancyLengthMonths', label: 'Tenancy duration (months, 1–120)', numeric: true },
  { key: 'householdSize', label: 'Household size (1–30)', numeric: true },
  { key: 'personalStory', label: 'Beyond the paperwork, why would you make a great tenant? (optional)', maxLength: 3000, multiline: true },
];
const landlord: ProfileField[] = [
  { key: 'companyName', label: 'Business name (optional)', maxLength: 150 },
  { key: 'lettingExperienceYears', label: 'Letting experience (years, 0–100)', numeric: true },
  { key: 'numberOfProperties', label: 'Number of properties', numeric: true },
  { key: 'locationsCovered', label: 'Locations covered (one per line)', multiline: true },
  { key: 'communicationStyle', label: 'Communication style', maxLength: 1000, multiline: true },
  { key: 'lettingApproach', label: 'Letting approach', maxLength: 2000, multiline: true },
  { key: 'tenantExpectations', label: 'What can a great tenant expect from you as a landlord?', maxLength: 3000, multiline: true },
  { key: 'tenancySuccess', label: 'What makes a tenancy work well for you? (optional)', maxLength: 3000, multiline: true },
  { key: 'registrationNumbers', label: 'Scottish landlord registration numbers (private, one per line)', multiline: true },
  { key: 'registrationDetails', label: 'Registration details (private)', maxLength: 2000, multiline: true },
];
export function profileFields(kind: OwnProfile['kind']): ProfileField[] { return [...base, ...(kind === 'renter' ? renter : landlord)]; }
export function profileDraft(profile: OwnProfile): Record<string, string> {
  return Object.fromEntries(Object.entries(profile).filter(([key]) => profileFields(profile.kind).some((field) => field.key === key))
    .map(([key, value]) => [key, Array.isArray(value) ? value.join('\n') : value == null ? '' : String(value)]));
}
// Explicit allowlist prevents role/verification/private document fields being sent.
// Only dirty fields are patched, preserving untouched and concurrently saved values.
export function profilePatch(profile: OwnProfile, draft: Record<string, string>): RenterProfileUpdate & LandlordProfileUpdate {
  const original = profileDraft(profile);
  const body: RenterProfileUpdate & LandlordProfileUpdate = {};
  for (const field of profileFields(profile.kind)) {
    const raw = draft[field.key] ?? ''; const value = raw.trim();
    if (raw === original[field.key]) continue;
    if (field.maxLength && value.length > field.maxLength) throw new Error(`${field.label} is too long.`);
    switch (field.key) {
      case 'displayName':
        if (!value) throw new Error('Display name is required.');
        body.displayName = value; break;
      case 'photoUrl':
        if (value) {
          let url: URL;
          try { url = new URL(value); } catch { throw new Error('Use a valid public HTTPS portrait URL.'); }
          if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use an HTTPS portrait URL without credentials.');
        }
        body.photoUrl = value || null; break;
      case 'budgetMin': case 'budgetMax': case 'tenancyLengthMonths': case 'householdSize': case 'lettingExperienceYears': case 'numberOfProperties': {
        let number: number | null = null;
        if (value) {
          const money = field.key === 'budgetMin' || field.key === 'budgetMax';
          if (!(money ? /^\d+(\.\d{1,2})?$/ : /^\d+$/).test(value)) throw new Error(`${field.label}: enter ${money ? 'an amount with up to two decimals' : 'a whole number'}.`);
          number = Number(value);
          const min = field.key === 'householdSize' || field.key === 'tenancyLengthMonths' ? 1 : 0;
          const max = money ? 99999999.99 : field.key === 'tenancyLengthMonths' ? 120 : field.key === 'householdSize' ? 30 : field.key === 'lettingExperienceYears' ? 100 : 100000;
          if (!Number.isFinite(number) || number < min || number > max) throw new Error(`${field.label}: enter a value from ${min} to ${max}.`);
        }
        body[field.key] = number; break;
      }
      case 'locationsCovered': case 'registrationNumbers': {
        const entries = [...new Set(raw.split('\n').map((item) => item.trim()).filter(Boolean))];
        if (entries.length > 50 || entries.some((item) => item.length > 100)) throw new Error(`${field.label}: up to 50 entries, each at most 100 characters.`);
        body[field.key] = entries; break;
      }
      case 'targetMoveDate':
        if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error('Enter a valid calendar date as YYYY-MM-DD.');
        body.targetMoveDate = value || null; break;
      default: body[field.key] = value || null;
    }
  }
  if (profile.kind === 'renter') {
    const min = body.budgetMin === undefined ? profile.budgetMin : body.budgetMin;
    const max = body.budgetMax === undefined ? profile.budgetMax : body.budgetMax;
    if (min !== null && max !== null && min > max) throw new Error('Minimum budget must not exceed maximum budget.');
  }
  return body;
}

// Presentation only: never use this value to hydrate forms or construct patches.
export function profileSummary(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/\bSynthetic Frontend Phase 1 Renter\b/gi, 'Demo renter')
    .replace(/(?:Synthetic\s+)?Phase\s*[12]\s+(?:connectivity|profile|API)\s+test[^.!?]*(?:[.!?]|$)/gi, '')
    .replace(/\bTest\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
    .replace(/Manual profile test[^.!?]*(?:[.!?]|$)/gi, '')
    .replace(/Synthetic renter testing the existing Profile save and reload workflow[.]?/gi, '')
    .replace(/\bSynthetic renter:\s*/gi, '')
    .replace(/\s+([.!?,])/g, '$1').replace(/\s+/g, ' ').replace(/^[\s.!?,—-]+|[\s—-]+$/g, '').trim();
}

export function mergeDiscoveryPages(current: DiscoveryPage, next: DiscoveryPage): DiscoveryPage {
  return { items: [...new Map([...current.items, ...next.items].map(item => [item.profile.id, item])).values()], nextCursor: next.nextCursor };
}

export const CONNECTION_STATUS_LABELS = { pending: 'Pending', review_later: 'Review later', accepted: 'Accepted', declined: 'Declined' } as const;
export function canDecideConnection(connection: Connection, userId: string | undefined): boolean {
  return !!userId && connection.recipientId === userId && connection.senderId !== userId && connection.direction === 'incoming' &&
    (connection.status === 'pending' || connection.status === 'review_later');
}
export function canMessageConnection(connection: Connection, userId: string | undefined): boolean {
  return !!userId && connection.status === 'accepted' && connection.conversationId === connection.id &&
    [connection.senderId, connection.recipientId].includes(userId);
}
export function mergeMessagePages(current: MessagePage, next: MessagePage): MessagePage {
  const items = [...new Map([...current.items, ...next.items].map(item => [item.id, item])).values()];
  items.sort((a, b) => a.cursor.length - b.cursor.length || a.cursor.localeCompare(b.cursor));
  return { items, nextCursor: next.nextCursor };
}
export function connectionFilter(section: 'Incoming' | 'Outgoing' | 'Accepted'): ConnectionFilter {
  return section === 'Accepted' ? { status: 'accepted' } : { direction: section === 'Incoming' ? 'incoming' : 'outgoing' };
}
export function mergeConnectionPages(current: ConnectionPage, next: ConnectionPage): ConnectionPage {
  return { items: [...new Map([...current.items, ...next.items].map(item => [item.id, item])).values()], nextCursor: next.nextCursor };
}
export function connectionIntroduction(note: string, mention: string): string {
  const introduction = [note.trim(), mention.trim() ? `Property mention: ${mention.trim()}` : ''].filter(Boolean).join('\n\n');
  if (!note.trim()) throw new Error('Write a personalised introduction.');
  if (introduction.length > 3000) throw new Error('Your introduction, including the property mention, must be at most 3,000 characters.');
  return introduction;
}
