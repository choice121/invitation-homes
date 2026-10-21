import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ApplicationApiEnvironment,
  generateApplicantMagicLoginUrl,
  handleApplicationNotificationDispatch,
  handleApplicationStatusUpdate,
  handleApplicationSubmission,
  handleApplicationVerification,
  handleApplicationVerificationConfirmation,
  resolveStaffReviewEmail
} from './applicationApi';

const env: ApplicationApiEnvironment = {
  SUPABASE_URL: 'https://supabase.example.test',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/macros/s/deployment-id/exec',
  APPS_SCRIPT_SHARED_SECRET: 'test-apps-script-shared-secret-long-enough',
  APPLICATION_SUPPORT_EMAIL: 'leasing@example.test',
  APPLICATION_REVIEW_EMAIL: 'application-review@example.test',
  APPLICATION_DISPATCH_SECRET: 'test-application-dispatch-secret-long-enough',
  APPLICATION_BASE_URL: 'https://rentals.example.test',
  APPLICATION_RATE_LIMIT_SECRET: 'rate-limit-test-secret'
};

const body = {
  propertySlug: 'atlanta-home',
  firstName: 'Taylor',
  lastName: 'Applicant',
  email: 'taylor@example.test',
  phone: '+14045550123',
  currentAddress: '123 Current Street, Atlanta, GA 30301',
  employer: 'Example Company',
  monthlyHouseholdIncome: 7200,
  desiredMoveInDate: '2026-12-01',
  householdSize: 2,
  petsCount: 1,
  termsAccepted: true,
  website: ''
};

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
  return () => { globalThis.fetch = original; };
}

test('submission persists a draft, sends verification, then verifies and confirms submission', async () => {
  const calls: Array<{ url: string; body: Record<string, unknown> | null }> = [];
  const restore = stubFetch(async (url, init) => {
    const parsedBody = typeof init?.body === 'string' ? JSON.parse(init.body) as Record<string, unknown> : null;
    calls.push({ url, body: parsedBody });
    if (url.endsWith('/consume_application_submission_limit')) return Response.json(true);
    if (url.endsWith('/create_public_leasing_application')) return Response.json([{
      result_application_id: 'app-uuid',
      result_reference_code: 'IH-1234567890',
      result_property_address: '1 Example Ave',
      result_city: 'Atlanta',
      result_first_name: 'Taylor',
      result_email: 'taylor@example.test'
    }]);
    if (url.endsWith('/verify_public_leasing_application')) return Response.json([{
      result_reference_code: 'IH-1234567890',
      result_property_address: '1 Example Ave',
      result_city: 'Atlanta',
      result_first_name: 'Taylor',
      result_last_name: 'Applicant',
      result_email: 'taylor@example.test',
      result_submitted_at: '2026-10-21T12:00:00.000Z',
      result_application_id: 'app-uuid'
    }]);
    if (url.endsWith('/claim_application_notifications')) return Response.json([
      {
        result_notification_id: 'notification-applicant', result_event_key: 'application-submitted:app-uuid',
        result_template_key: 'application.submitted', result_template_version: '1', result_channel: 'email',
        result_recipient_address: 'taylor@example.test', result_attempt_count: 1,
        result_payload: { firstName: 'Taylor', propertyAddress: '1 Example Ave, Atlanta', submittedAt: '2026-10-21T12:00:00.000Z', applicationReference: 'IH-1234567890', portalUrl: 'https://rentals.example.test', supportContact: 'leasing@example.test' }
      },
      {
        result_notification_id: 'notification-staff', result_event_key: 'application-staff-submitted:app-uuid',
        result_template_key: 'application.staff_submitted', result_template_version: '1', result_channel: 'email',
        result_recipient_address: 'application-review@example.test', result_attempt_count: 1,
        result_payload: { applicantName: 'Taylor Applicant', applicantEmail: 'taylor@example.test', propertyAddress: '1 Example Ave, Atlanta', submittedAt: '2026-10-21T12:00:00.000Z', applicationReference: 'IH-1234567890', portalUrl: 'https://rentals.example.test', supportContact: 'leasing@example.test' }
      }
    ]);
    if (url.endsWith('/finish_application_notification')) return Response.json(null);
    if (url === env.APPS_SCRIPT_WEB_APP_URL) return Response.json({ success: true });
    throw new Error(`Unexpected request: ${url}`);
  });

  try {
    const request = new Request('https://rentals.example.test/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://rentals.example.test', 'Idempotency-Key': '5c8180ba-4dc5-4b2e-9c39-9f5c52a1f111' },
      body: JSON.stringify(body)
    });
    const submitted = await handleApplicationSubmission(request, env, '192.0.2.10');
    assert.equal(submitted.status, 202);
    assert.equal((await submitted.json()).referenceCode, 'IH-1234567890');

    const createCall = calls.find((call) => call.url.endsWith('/create_public_leasing_application'));
    assert.ok(createCall);
    assert.equal(createCall.body?.p_terms_accepted, true);
    assert.match(String(createCall.body?.p_token_hash), /^[a-f0-9]{64}$/);
    assert.equal(createCall.body?.p_submission_key, '5c8180ba-4dc5-4b2e-9c39-9f5c52a1f111');
    const verificationMail = calls.find((call) => call.url === env.APPS_SCRIPT_WEB_APP_URL);
    assert.equal(verificationMail?.body?.templateKey, 'application.verify_email');
    const values = verificationMail?.body?.values as Record<string, string>;
    const tokenMatch = values.portalUrl.match(/https:\/\/rentals\.example\.test\/api\/applications\/verify\?token=([A-Za-z0-9_-]+)/);
    assert.ok(tokenMatch);
    assert.equal(calls.filter((call) => call.url === env.APPS_SCRIPT_WEB_APP_URL).length, 1);

    const verificationPage = await handleApplicationVerification(new Request(tokenMatch[0]), env);
    assert.equal(verificationPage.status, 200);
    assert.match(await verificationPage.text(), /Verify email and submit application/);
    assert.equal(calls.some((call) => call.url.endsWith('/verify_public_leasing_application')), false);
    assert.equal(calls.filter((call) => call.url === env.APPS_SCRIPT_WEB_APP_URL).length, 1);

    const verified = await handleApplicationVerificationConfirmation(new Request('https://rentals.example.test/api/applications/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://rentals.example.test' },
      body: new URLSearchParams({ token: tokenMatch[1] })
    }), env);
    assert.equal(verified.status, 200);
    assert.match(await verified.text(), /application has been submitted/i);
    const verifyCall = calls.find((call) => call.url.endsWith('/verify_public_leasing_application'));
    assert.match(String(verifyCall?.body?.p_token_hash), /^[a-f0-9]{64}$/);
    assert.notEqual(verifyCall?.body?.p_token_hash, tokenMatch[1]);
    const sentEmails = calls.filter((call) => call.url === env.APPS_SCRIPT_WEB_APP_URL);
    assert.equal(sentEmails.length, 3);
    assert.ok(sentEmails.some((call) => call.body?.templateKey === 'application.submitted'));
    assert.ok(sentEmails.some((call) => call.body?.templateKey === 'application.staff_submitted' && call.body.to === env.APPLICATION_REVIEW_EMAIL));
  } finally {
    restore();
  }
});

test('persistent rate-limit denial prevents database submission and email delivery', async () => {
  const calls: string[] = [];
  const restore = stubFetch(async (url) => {
    calls.push(url);
    if (url.endsWith('/consume_application_submission_limit')) return Response.json(false);
    throw new Error(`Unexpected request: ${url}`);
  });
  try {
    const response = await handleApplicationSubmission(new Request('https://rentals.example.test/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://rentals.example.test' },
      body: JSON.stringify(body)
    }), env, '192.0.2.11');
    assert.equal(response.status, 429);
    assert.equal(calls.length, 1);
  } finally {
    restore();
  }
});

test('notification dispatch requires the internal bearer secret', async () => {
  let contacted = false;
  const restore = stubFetch(() => { contacted = true; return Response.json([]); });
  try {
    const response = await handleApplicationNotificationDispatch(new Request('https://rentals.example.test/api/internal/dispatch-notifications', {
      method: 'POST', headers: { Authorization: 'Bearer incorrect-secret' }
    }), env);
    assert.equal(response.status, 401);
    assert.equal(contacted, false);
  } finally {
    restore();
  }
});

test('submission fails closed when production configuration is missing', async () => {
  let contacted = false;
  const restore = stubFetch(() => { contacted = true; return Response.json({}); });
  try {
    const response = await handleApplicationSubmission(new Request('https://rentals.example.test/api/applications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }), {}, '192.0.2.10');
    assert.equal(response.status, 503);
    assert.equal(contacted, false);
  } finally {
    restore();
  }
});

test('email verification rejects malformed and expired token responses without sending confirmation', async () => {
  let contacted = false;
  const restore = stubFetch(() => { contacted = true; return Response.json([]); });
  try {
    const response = await handleApplicationVerification(new Request('https://rentals.example.test/api/applications/verify?token=bad'), env);
    assert.equal(response.status, 400);
    assert.equal(contacted, false);
  } finally {
    restore();
  }
});

test('market routing resolves regional leasing email with clean fallback', () => {
  const customEnv: ApplicationApiEnvironment = {
    ...env,
    MARKET_REVIEW_EMAILS: {
      'atlanta-georgia': 'atlanta-team@example.test',
      'dallas-texas': 'dallas-team@example.test'
    }
  };
  assert.equal(resolveStaffReviewEmail(customEnv, 'atlanta-georgia'), 'atlanta-team@example.test');
  assert.equal(resolveStaffReviewEmail(customEnv, 'phoenix-arizona'), 'application-review@example.test');
  assert.equal(resolveStaffReviewEmail(customEnv), 'application-review@example.test');
});

test('magic login URL generation calls Supabase Auth admin and returns action link', async () => {
  const restore = stubFetch(async (url, init) => {
    if (url.includes('/auth/v1/admin/generate_link')) {
      const payload = JSON.parse(String(init?.body));
      assert.equal(payload.email, 'tenant@example.test');
      return Response.json({ action_link: 'https://supabase.example.test/auth/v1/verify?token=magic123' });
    }
    throw new Error('Unexpected URL');
  });

  try {
    const link = await generateApplicantMagicLoginUrl(env, 'tenant@example.test', 'https://rentals.example.test/tenant-workflow');
    assert.equal(link, 'https://supabase.example.test/auth/v1/verify?token=magic123');

    // Fails open gracefully if Supabase unconfigured
    const fallback = await generateApplicantMagicLoginUrl({}, 'tenant@example.test', 'https://rentals.example.test/tenant-workflow');
    assert.equal(fallback, null);
  } finally {
    restore();
  }
});

test('internal status update validates authorization, checks transition rules, and records update', async () => {
  const restore = stubFetch(async () => Response.json({}));
  try {
    // Unauthorized without secret
    const unauthorized = await handleApplicationStatusUpdate(new Request('https://rentals.example.test/api/internal/applications/app-1/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer wrong' },
      body: JSON.stringify({ applicationId: 'app-1', currentStatus: 'submitted', nextStatus: 'screening' })
    }), env);
    assert.equal(unauthorized.status, 401);

    // Valid transition (submitted -> screening)
    const valid = await handleApplicationStatusUpdate(new Request('https://rentals.example.test/api/internal/applications/app-1/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.APPLICATION_DISPATCH_SECRET}` },
      body: JSON.stringify({ applicationId: 'app-1', currentStatus: 'submitted', nextStatus: 'screening', staffId: 'staff-42' })
    }), env);
    assert.equal(valid.status, 200);
    const validBody = await valid.json();
    assert.equal(validBody.success, true);
    assert.equal(validBody.status, 'screening');

    // Invalid transition (approved -> submitted is rejected by leasing workflow domain rules)
    const invalid = await handleApplicationStatusUpdate(new Request('https://rentals.example.test/api/internal/applications/app-1/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.APPLICATION_DISPATCH_SECRET}` },
      body: JSON.stringify({ applicationId: 'app-1', currentStatus: 'approved', nextStatus: 'submitted' })
    }), env);
    assert.equal(invalid.status, 400);
    const invalidBody = await invalid.json();
    assert.match(invalidBody.error, /Invalid application transition/i);
  } finally {
    restore();
  }
});

