// Contract types for integrated profile and public discovery capabilities. The installed shared-types package predates
// API_CONTRACT.md; replace these with shared exports when that package catches up.
import type { TrustPillar } from './trustPillars';
export type CheckStatus = 'unverified' | 'pending' | 'verified' | 'failed' | 'expired';
export type Verification = {
  identityStatus: CheckStatus;
  photoStatus: 'unverified' | 'pending' | 'verified';
  mode: 'real' | 'demo';
};
type PublicBase = {
  id: string; displayName: string; bio: string | null; photoUrl: string | null; memberSince: string;
};
export type HouseholdType = 'single' | 'couple' | 'family' | 'sharers';
export type HouseholdPreference = 'pet_friendly' | 'smoke_free' | 'sharing';
export type PublicRenterProfile = PublicBase & {
  kind: 'renter'; personalStory: string | null; preferredLocation: string | null;
  budgetMin: number | null; budgetMax: number | null; targetMoveDate: string | null;
  tenancyLengthMonths: number | null; householdSize: number | null;
  householdType: HouseholdType | null; householdPreferences: HouseholdPreference[];
  verification: Verification;
  evidenceSummary: EvidenceStrandSummary[];
};
export type PublicLandlordProfile = PublicBase & {
  kind: 'landlord'; companyName: string | null; landlordType: 'individual' | 'company' | 'agent' | null;
  lettingExperienceYears: number | null; numberOfProperties: number | null;
  locationsCovered: string[]; communicationStyle: string | null; lettingApproach: string | null;
  tenantExpectations: string | null; tenancySuccess: string | null;
  verification: Verification & { registrationStatus: CheckStatus };
  properties: PublicProperty[];
  arcsPreferences: PublicArcsPreferences;
};
export type OwnRenterProfile = PublicRenterProfile & {
  currentLocation: string | null; discoverable: boolean; updatedAt: string;
};
export type OwnLandlordProfile = PublicLandlordProfile & {
  registrationNumbers: string[]; registrationDetails: string | null; discoverable: boolean; updatedAt: string;
};
export type OwnProfile = OwnRenterProfile | OwnLandlordProfile;
export type PublicProfile = PublicRenterProfile | PublicLandlordProfile;
type BaseUpdate = Pick<OwnRenterProfile, 'displayName' | 'bio' | 'photoUrl' | 'discoverable'>;
export type RenterProfileUpdate = Partial<BaseUpdate & Pick<OwnRenterProfile,
  'currentLocation' | 'preferredLocation' | 'budgetMin' | 'budgetMax' | 'targetMoveDate' |
  'tenancyLengthMonths' | 'householdSize' | 'householdType' | 'householdPreferences' | 'personalStory'>>;
export type LandlordProfileUpdate = Partial<BaseUpdate & Pick<OwnLandlordProfile,
  'companyName' | 'landlordType' | 'lettingExperienceYears' | 'numberOfProperties' | 'locationsCovered' |
  'communicationStyle' | 'lettingApproach' | 'tenantExpectations' | 'tenancySuccess' |
  'registrationNumbers' | 'registrationDetails'>>;
export type ProfileUpdate = RenterProfileUpdate | LandlordProfileUpdate;
export type EvidenceOption = { id: string; pillar: TrustPillar; label: string; displayOrder: number };
export type LegalDocument = {
  id: string; kind: 'terms' | 'privacy_notice'; version: string; title: string;
  content: string; publishedAt: string; demoOnly: boolean;
};
export type LegalDocuments = { terms: LegalDocument; privacyNotice: LegalDocument };
export type ConsentPurpose = 'product_updates' | 'user_research';
export type TermsAcceptance = { version: string; acceptedAt: string };
export type NoticeAcknowledgement = { version: string; acknowledgedAt: string };
export type ConsentRecord = {
  id: string; purpose: ConsentPurpose; granted: boolean; recordedAt: string; privacyNoticeVersion: string;
};
export type PrivacyState = {
  termsAcceptances: TermsAcceptance[];
  privacyAcknowledgements: NoticeAcknowledgement[];
  consents: { purpose: ConsentPurpose; granted: boolean; privacyNoticeVersion: string | null; recordedAt: string | null }[];
};
// Corrected existing landlord endpoint projection (no full address).
export type LandlordPropertyProfile = Pick<PublicLandlordProfile, 'id' | 'displayName' | 'memberSince'> & {
  properties: { id: string; city: string; bedrooms: number; rentAmount: number }[];
};

// Public allowlists only; private addresses, registration details and evidence files
// have no fields in these types. Owner CRUD continues using its existing types.
export type EvidenceStrandSummary = {
  pillar: TrustPillar; status: 'Information added' | 'Document uploaded' | 'Not provided';
  categories: { catalogueId: string | null; label: string; status: 'Information added' | 'Document uploaded' }[];
};
export type PublicArcsPreferences = {
  priorityOrder: TrustPillar[];
  evidencePreferences: Record<string, 'accept' | 'prefer' | 'not_needed'>;
};
export type PublicPropertyDetails = {
  publicArea?: string | null; postcodeDistrict?: string | null; depositAmount?: number | null;
  billsIncluded?: string[]; billsExcluded?: string[]; availableFrom?: string | null;
  minTenancyMonths?: number | null; expectedTenancyMonths?: number | null;
  propertyType?: 'flat' | 'house' | 'room' | 'studio' | 'other' | null;
  bathrooms?: number | null; permittedOccupants?: number | null;
  furnishing?: 'furnished' | 'part_furnished' | 'unfurnished' | null;
  keyFeatures?: string[]; councilTaxBand?: string | null; epcRating?: string | null;
  hmoLicenceStatus?: 'not_required' | 'pending' | 'licensed' | 'unknown' | null;
  heating?: string | null; energyFeatures?: string[]; parking?: string | null;
  outdoorSpace?: string | null; accessibilityFeatures?: string[];
  petsPolicy?: 'allowed' | 'not_allowed' | 'considered' | null;
  smokingPolicy?: 'allowed' | 'not_allowed' | null; otherConditions?: string | null;
  walkthroughUrl?: string | null; walkthroughType?: 'video' | 'live' | null;
};
export type PublicPropertyPhoto = {
  id: string; mimeType: 'image/png' | 'image/jpeg' | 'image/webp'; caption: string | null; position: number;
};
export type PublicProperty = {
  id: string; landlordId: string; title: string | null; description: string | null;
  city: string; bedrooms: number; rentAmount: number; currency: string; propertyRules: string[];
  status: 'published'; listingStatus: 'available'; publishedAt: string; archivedAt: null;
  createdAt: string; updatedAt: string; details: PublicPropertyDetails;
  arcsPreferences: PublicArcsPreferences; photos: PublicPropertyPhoto[];
};
export type DiscoveryMode = 'all' | 'suggested';
export type DiscoveryItem = { profile: PublicProfile; reasons: string[] };
export type DiscoveryPage = { items: DiscoveryItem[]; nextCursor: string | null };
export type PublicPhotoAccess = { url: string; expiresIn: 60 };

export type ConnectionStatus = 'pending' | 'review_later' | 'accepted' | 'declined';
export type Connection = {
  id: string; senderId: string; recipientId: string; introduction: string; status: ConnectionStatus;
  direction: 'incoming' | 'outgoing'; createdAt: string; updatedAt: string; acceptedAt: string | null;
  conversationId: string | null; counterparty: PublicProfile | null;
};
export type ConnectionPage = { items: Connection[]; nextCursor: string | null };
export type ConnectionFilter = { direction?: 'incoming' | 'outgoing'; status?: ConnectionStatus };
export type ConnectionDecision = 'accept' | 'decline' | 'review-later';

export type Message = { id: string; connectionId: string; senderId: string; text: string; sentAt: string; cursor: string };
export type MessagePage = { items: Message[]; nextCursor: string | null };
