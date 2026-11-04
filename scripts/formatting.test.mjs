import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
const source = fs.readFileSync(new URL('../src/lib/formatting.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports });
const { formatMonthlyBudget, formatCalendarDate } = exports;

test('GBP budgets group thousands, retain pence, and preserve a zero lower bound', () => {
  assert.equal(formatMonthlyBudget(0, 1350.5), '£0 – £1,350.50 per month');
  assert.equal(formatMonthlyBudget(800, 1400), '£800 – £1,400 per month');
  assert.equal(formatMonthlyBudget(null, 1350.05), 'Up to £1,350.05 per month');
  assert.equal(formatMonthlyBudget(1250.5, null), 'From £1,250.50 per month');
});

test('missing or invalid budgets never render NaN, Infinity or a fabricated zero', () => {
  for (const value of [undefined, null, NaN, Infinity, -1]) {
    assert.equal(formatMonthlyBudget(value, value), 'Not provided');
    assert.equal(formatMonthlyBudget(value, 950), 'Up to £950 per month');
  }
});

test('calendar dates stay on the same day across timezone and DST boundaries', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of ['UTC', 'America/Los_Angeles', 'Europe/London', 'Pacific/Kiritimati']) {
      process.env.TZ = timezone;
      assert.equal(formatCalendarDate('2026-11-01'), '1 November 2026', timezone);
      assert.equal(formatCalendarDate('2026-03-29'), '29 March 2026', timezone);
      assert.equal(formatCalendarDate('2024-02-29'), '29 February 2024', timezone);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test('missing, malformed and impossible dates have an honest fallback without rollover', () => {
  for (const value of [undefined, null, '', 'invalid', '2026-02-29', '2026-04-31', '2026-13-01',
    '2026-00-01', '2026-01-00', '0000-01-01', '2026-1-1', '2026-11-01T00:00:00Z']) {
    assert.equal(formatCalendarDate(value), 'Not provided', String(value));
  }
});
