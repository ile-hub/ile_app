import type { Property, PropertyRule, TenancyInterestPropertySummary } from '@yourorg/ile-shared-types';

// The API stores rule slugs; the app shows these labels.
export const PROPERTY_RULE_LABELS: Record<PropertyRule, string> = {
  no_smoking: 'No smoking',
  no_pets: 'No pets',
  sharers_ok: 'Sharers OK',
};

export const PROPERTY_RULE_OPTIONS = Object.keys(PROPERTY_RULE_LABELS) as PropertyRule[];

export function formatRent(amount: number, currency: string): string {
  const symbol = currency === 'GBP' ? '£' : `${currency} `;
  // Whole pounds stay whole (£1,250); anything with pence shows both
  // digits (£1,250.50, not £1,250.5).
  const digits = Number.isInteger(amount) ? 0 : 2;
  return `${symbol}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}/month`;
}

export function formatBedrooms(bedrooms: number): string {
  return bedrooms === 0 ? 'Studio' : `${bedrooms} bed`;
}

// What a property is called in lists: the listing title if it has one,
// otherwise its first address line.
export function propertyName(property: Pick<Property, 'addressLine1'> & { title?: string | null }) {
  return property.title || property.addressLine1;
}

export function propertySummaryLine(
  property: Pick<TenancyInterestPropertySummary, 'city' | 'bedrooms' | 'rentAmount' | 'currency'>,
) {
  return `${property.city.replace(/^demo\s+/i, '')} · ${formatBedrooms(property.bedrooms)} · ${formatRent(
    property.rentAmount,
    property.currency,
  )}`;
}

// Keep fixture address markers out of property presentation.
export function propertyLocation(property: Pick<Property, 'addressLine1' | 'city' | 'postcode'>) {
  const address = /^synthetic placeholder\s*[-–—]\s*not an address$/i.test(property.addressLine1.trim()) ? '' : property.addressLine1;
  const city = property.city.replace(/^demo\s+/i, '');
  const postcode = /^demo$/i.test(property.postcode.trim()) ? '' : property.postcode;
  return [address, [city, postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}
