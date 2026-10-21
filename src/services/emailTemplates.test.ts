import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { EMAIL_TEMPLATE_VERSION, EMAIL_TEMPLATES, EmailTemplateKey, renderEmailTemplate } from './emailTemplates';

const values: Record<string, string> = {
  firstName: 'Taylor',
  portalUrl: 'https://portal.example.test/account',
  supportContact: 'support@example.test',
  propertyAddress: '123 Main Street',
  tourDate: 'October 30, 2026',
  tourTime: '2:00 PM',
  eventSummary: 'Please review the updated information.',
  submittedAt: 'October 20, 2026',
  amount: '$1,800.00',
  paymentDate: 'October 20, 2026',
  receiptReference: 'R-10001',
  dueDate: 'November 1, 2026',
  approvedNoticeContent: 'Approved notice content.',
  approvedEmergencyInstructions: 'Approved emergency instructions.',
  offerExpiresAt: 'October 22, 2026 at 5:00 PM local time',
  eventDate: 'October 20, 2026',
  expiresAt: 'October 21, 2026 1:00 PM UTC',
  applicationReference: 'IH-1234567890',
  applicantName: 'Taylor Applicant',
  moveInDate: 'November 1, 2026',
  requestReference: 'M-1001',
  approvedDispositionContent: 'Approved deposit disposition.',
  approvedIncidentContent: 'Approved incident update.'
};

test('every catalog event renders versioned subject, plain text, and HTML', () => {
  const keys = Object.keys(EMAIL_TEMPLATES) as EmailTemplateKey[];
  assert.equal(keys.length, 40);
  for (const key of keys) {
    const rendered = renderEmailTemplate(key, values, { approvedContent: true });
    assert.equal(rendered.key, key);
    assert.equal(rendered.version, EMAIL_TEMPLATE_VERSION);
    assert.ok(rendered.subject.length > 0);
    assert.ok(rendered.text.includes('Hello Taylor'));
    assert.ok(rendered.html.startsWith('<!doctype html>'));
    assert.ok(!rendered.html.includes('{{'));
  }
});

test('Apps Script and application catalogs contain the same template keys', () => {
  const script = readFileSync(new URL('../../apps-script/Code.gs', import.meta.url), 'utf8');
  const scriptKeys = Array.from(script.matchAll(/^\s*'([^']+)':\s*\[/gm), (match) => match[1]).sort();
  const applicationKeys = (Object.keys(EMAIL_TEMPLATES) as EmailTemplateKey[]).sort();
  assert.deepEqual(scriptKeys, applicationKeys);
});

test('rendering escapes HTML and rejects unsafe portal URLs', () => {
  const rendered = renderEmailTemplate('application.submitted', {
    ...values,
    firstName: '<script>alert(1)</script>',
    propertyAddress: '<img src=x onerror=alert(1)>'
  });
  assert.ok(rendered.html.includes('&lt;script&gt;'));
  assert.ok(rendered.html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!rendered.html.includes('<script>'));
  assert.throws(() => renderEmailTemplate('account.verify', { ...values, portalUrl: 'javascript:alert(1)' }), /HTTPS/);
});

test('required template values must be present', () => {
  const { tourDate: _tourDate, ...missingTourDate } = values;
  assert.throws(() => renderEmailTemplate('tour.confirmed', missingTourDate), (error: Error) => {
    assert.match(error.message, /tourDate/);
    return true;
  });
});

test('sensitive notice templates require approved content before rendering', () => {
  for (const key of ['application.adverse_action', 'maintenance.emergency', 'deposit.disposition', 'service.incident'] as const) {
    assert.throws(() => renderEmailTemplate(key, values), /requires approved content/);
    assert.doesNotThrow(() => renderEmailTemplate(key, values, { approvedContent: true }));
  }
});
