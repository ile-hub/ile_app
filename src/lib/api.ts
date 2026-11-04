import type { Message, MessagePage, Connection, ConnectionPage, ConnectionFilter, ConnectionDecision, DiscoveryMode, DiscoveryPage, PublicProperty, PublicPhotoAccess, OwnProfile, PublicProfile, ProfileUpdate, EvidenceOption, LegalDocuments, PrivacyState, TermsAcceptance, NoticeAcknowledgement, ConsentPurpose, ConsentRecord, LandlordPropertyProfile } from './phase1Types';
import type {
  CreatePropertyRequest,
  ExpressInterestRequest,
  MeResponse,
  Property,
  PropertyFeedResponse,
  TenancyInterest,
  TenancyInterestStatus,
  UpdatePropertyRequest,
} from '@yourorg/ile-shared-types';

import { supabase } from './supabase';

// Base URL of ile-api. Must be read with plain dot notation — Expo only
// inlines EXPO_PUBLIC_ variables written exactly as
// process.env.EXPO_PUBLIC_NAME. Local values:
//   - iOS simulator:     http://localhost:3000
//   - Android emulator:  http://10.0.2.2:3000  (the emulator's alias for the host)
//   - physical device:   http://<your machine's LAN IP>:3000
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('Missing EXPO_PUBLIC_API_URL');
}

// Thrown for any non-2xx response (or a network failure, status 0).
// `message` is always a single human-readable string: Nest validation
// errors arrive as string[] and are joined.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// The exact message ile-api's PropertiesService returns from publish when
// REQUIRE_VERIFICATION=true and the landlord isn't verified.
const VERIFICATION_REQUIRED = 'Landlord verification is required before publishing';

export function isVerificationRequired(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === 403 && error.message === VERIFICATION_REQUIRED
  );
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT';

async function request<T>(method: Method, path: string, body?: unknown, authenticated = true): Promise<T> {
  const session = authenticated ? await supabase.auth.getSession() : null;
  const token = session?.data.session?.access_token;

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  const parsed: unknown = text ? safeJson(text) : undefined;

  if (!response.ok) {
    // The session is no longer valid for the API — sign out so the app
    // returns to Login instead of failing every request. AuthProvider
    // reacts to the auth state change.
    if (authenticated && response.status === 401) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    throw new ApiError(response.status, errorMessage(parsed, response.status), parsed);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string') return message;
  }
  return `Request failed (${status})`;
}

// Every endpoint the app uses, typed against @yourorg/ile-shared-types.
// Paths match ile-api's controllers (see ile-api/endpoint.md).
export const api = {
  listMessages: (connectionId: string, after?: string) => request<MessagePage>('GET',
    `/connections/${encodeURIComponent(connectionId)}/messages?limit=50${after ? `&after=${encodeURIComponent(after)}` : ''}`),
  sendMessage: (connectionId: string, text: string) => request<Message>('POST',
    `/connections/${encodeURIComponent(connectionId)}/messages`, { text }),
  createConnection: (body: { recipientId: string; introduction: string }) => request<Connection>('POST', '/connections', body),
  listConnections: (filter: ConnectionFilter = {}, after?: string) => {
    const query = new URLSearchParams({ limit: '20' });
    if (filter.direction) query.set('direction', filter.direction);
    if (filter.status) query.set('status', filter.status);
    if (after) query.set('after', after);
    return request<ConnectionPage>('GET', `/connections?${query.toString()}`);
  },
  getConnection: (id: string) => request<Connection>('GET', `/connections/${encodeURIComponent(id)}`),
  decideConnection: (id: string, action: ConnectionDecision) => request<Connection>('POST', `/connections/${encodeURIComponent(id)}/${action}`),
  getMe: () => request<MeResponse>('GET', '/me'),
  getOwnProfile: () => request<OwnProfile>('GET', '/me/profile'),
  updateOwnProfile: (body: ProfileUpdate) => request<OwnProfile>('PATCH', '/me/profile', body),
  getProfilePreview: () => request<PublicProfile>('GET', '/me/profile/preview'),
  getPublicProfile: (id: string) => request<PublicProfile>('GET', `/profiles/${encodeURIComponent(id)}`),
  discover: (mode: DiscoveryMode, after?: string) => request<DiscoveryPage>('GET',
    `/discovery?mode=${mode}&limit=20${after ? `&after=${encodeURIComponent(after)}` : ''}`),
  getPublicLandlordProperties: (landlordId: string) => request<PublicProperty[]>('GET',
    `/landlords/${encodeURIComponent(landlordId)}/properties`),
  getPublicLandlordProperty: (landlordId: string, propertyId: string) => request<PublicProperty>('GET',
    `/landlords/${encodeURIComponent(landlordId)}/properties/${encodeURIComponent(propertyId)}`),
  getPublicPropertyPhoto: (landlordId: string, propertyId: string, photoId: string) => request<PublicPhotoAccess>('GET',
    `/landlords/${encodeURIComponent(landlordId)}/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(photoId)}/download`),
  evidenceCatalogue: () => request<EvidenceOption[]>('GET', '/evidence/catalogue'),
  legalDocuments: () => request<LegalDocuments>('GET', '/legal/documents', undefined, false),
  getPrivacy: () => request<PrivacyState>('GET', '/me/privacy'),
  acceptTerms: (termsVersion: string) => request<TermsAcceptance>('POST', '/me/privacy/terms-acceptance', { termsVersion, accepted: true }),
  acknowledgeNotice: (privacyNoticeVersion: string) => request<NoticeAcknowledgement>('POST', '/me/privacy/notice-acknowledgement', { privacyNoticeVersion, acknowledged: true }),
  setConsent: (purpose: ConsentPurpose, granted: boolean, privacyNoticeVersion: string) =>
    request<ConsentRecord>('PUT', '/me/privacy/consents', { purpose, granted, privacyNoticeVersion }),

  // Landlord
  listMyProperties: () => request<Property[]>('GET', '/properties/me'),
  createProperty: (body: CreatePropertyRequest) =>
    request<Property>('POST', '/properties', body),
  updateProperty: (id: string, body: UpdatePropertyRequest) =>
    request<Property>('PATCH', `/properties/${id}`, body),
  publishProperty: (id: string) => request<Property>('POST', `/properties/${id}/publish`),
  archiveProperty: (id: string) => request<Property>('POST', `/properties/${id}/archive`),

  // Renter
  propertyFeed: (limit: number, offset: number) =>
    request<PropertyFeedResponse>('GET', `/properties?limit=${limit}&offset=${offset}`),

  // Either (renters only ever get published properties back)
  getProperty: (id: string) => request<Property>('GET', `/properties/${id}`),

  // Renter-facing landlord profile. 404 if the id isn't a landlord, doesn't
  // exist, or has no published properties — all the same 404, so the
  // endpoint never confirms a landlord exists.
  getLandlordProfile: (id: string) => request<LandlordPropertyProfile>('GET', `/landlords/${id}`),

  // Tenancy interests. With no status, /me returns every row except
  // declined ones.
  listMyInterests: (status?: Exclude<TenancyInterestStatus, 'withdrawn'>) =>
    request<TenancyInterest[]>(
      'GET',
      status ? `/tenancy-interests/me?status=${status}` : '/tenancy-interests/me',
    ),
  getInterest: (id: string) => request<TenancyInterest>('GET', `/tenancy-interests/${id}`),
  listPropertyInterests: (propertyId: string) =>
    request<TenancyInterest[]>('GET', `/properties/${propertyId}/tenancy-interests`),
  expressInterest: (body: ExpressInterestRequest) =>
    request<TenancyInterest>('POST', '/tenancy-interests', body),
  declineInterest: (id: string) =>
    request<TenancyInterest>('POST', `/tenancy-interests/${id}/decline`),
};
