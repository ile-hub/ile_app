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
  return `${property.city} · ${formatBedrooms(property.bedrooms)} · ${formatRent(
    property.rentAmount,
    property.currency,
  )}`;
}
