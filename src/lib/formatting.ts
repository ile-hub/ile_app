function money(value: number): string {
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value);
}

export function formatMonthlyBudget(min?: number | null, max?: number | null): string {
  const valid = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (valid(min) && valid(max)) return `${money(min)} – ${money(max)} per month`;
  if (valid(max)) return `Up to ${money(max)} per month`;
  if (valid(min)) return `From ${money(min)} per month`;
  return 'Not provided';
}

// API move dates are calendar dates, not instants. Validate and format in UTC
// so a device's timezone cannot move the date to the preceding/following day.
export function formatCalendarDate(value?: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return 'Not provided';
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return 'Not provided';
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return 'Not provided';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
