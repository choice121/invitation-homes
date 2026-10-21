import { EmailTemplateKey, renderEmailTemplate } from './emailTemplates';
import { APPLICATION_TERMS_VERSION } from './applicationTerms';
import { ApplicationStatus, assertApplicationTransition } from './leasingWorkflow';

export interface ApplicationApiEnvironment {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APPS_SCRIPT_WEB_APP_URL?: string;
  APPS_SCRIPT_SHARED_SECRET?: string;
  APPLICATION_SUPPORT_EMAIL?: string;
  APPLICATION_REVIEW_EMAIL?: string;
  APPLICATION_DISPATCH_SECRET?: string;
  APPLICATION_BASE_URL?: string;
  APPLICATION_RATE_LIMIT_SECRET?: string;
  MARKET_REVIEW_EMAILS?: Record<string, string>;
}

interface ApplicantSubmission {
  propertySlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentAddress: string;
  employer: string;
  monthlyHouseholdIncome: number;
  desiredMoveInDate: string;
  householdSize: number;
  petsCount: number;
  termsAccepted: boolean;
  website: string;
  primaryPaymentMethod?: string;
  paymentHandle?: string;
}

interface CreatedApplication {
  result_application_id: string;
  result_reference_code: string;
  result_property_address: string;
  result_city: string;
  result_first_name: string;
  result_last_name: string;
  result_email: string;
}

interface VerifiedApplication {
  result_reference_code: string;
  result_property_address: string;
  result_city: string;
  result_first_name: string;
  result_last_name: string;
  result_email: string;
  result_submitted_at: string;
  result_application_id: string;
}

interface ApplicationNotification {
  result_notification_id: string;
  result_event_key: string;
  result_template_key: EmailTemplateKey;
  result_template_version: string;
  result_channel: string;
  result_recipient_address: string;
  result_payload: Record<string, string>;
  result_attempt_count: number;
}

const MAX_REQUEST_BYTES = 16_384;
const VERIFICATION_TTL_MS = 30 * 60 * 1000;
function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function htmlResponse(status: number, title: string, message: string, reference?: string): Response {
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
  const ref = reference ? `<p>Application reference: <strong>${escape(reference)}</strong></p>` : '';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title></head><body><main><h1>${escape(title)}</h1><p>${escape(message)}</p>${ref}<a href="/search/houses-for-rent">Return to home search</a></main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function normalizeBaseUrl(value: string | undefined): URL {
  if (!value) throw new Error('APPLICATION_BASE_URL is not configured.');
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('APPLICATION_BASE_URL must use HTTPS.');
  }
  return url;
}

function requireConfiguration(env: ApplicationApiEnvironment) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.APPS_SCRIPT_WEB_APP_URL || !env.APPS_SCRIPT_SHARED_SECRET || !env.APPLICATION_RATE_LIMIT_SECRET || !env.APPLICATION_REVIEW_EMAIL || !env.APPLICATION_SUPPORT_EMAIL || !env.APPLICATION_DISPATCH_SECRET) {
    throw new Error('Application storage, Google Apps Script, staff mailbox, or rate-limit configuration is missing.');
  }
  if (env.APPS_SCRIPT_SHARED_SECRET.length < 32) throw new Error('APPS_SCRIPT_SHARED_SECRET must be at least 32 characters.');
  if (env.APPLICATION_DISPATCH_SECRET.length < 32) throw new Error('APPLICATION_DISPATCH_SECRET must be at least 32 characters.');
  const baseUrl = normalizeBaseUrl(env.APPLICATION_BASE_URL);
  const scriptUrl = new URL(env.APPS_SCRIPT_WEB_APP_URL);
  if (scriptUrl.protocol !== 'https:' || scriptUrl.hostname !== 'script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(scriptUrl.pathname)) {
    throw new Error('APPS_SCRIPT_WEB_APP_URL must be a deployed Google Apps Script web app URL.');
  }
  return { baseUrl, termsVersion: APPLICATION_TERMS_VERSION };
}

function readString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== 'string') throw new Error(`${name} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`${name} must be between 1 and ${maxLength} characters.`);
  return normalized;
}

function readInteger(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be a whole number between ${min} and ${max}.`);
  }
  return value;
}

function validateSubmission(input: unknown): ApplicantSubmission {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid application request.');
  const body = input as Record<string, unknown>;
  const email = readString(body.email, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const moveInDate = readString(body.desiredMoveInDate, 'Preferred move-in date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(moveInDate) || Number.isNaN(Date.parse(`${moveInDate}T00:00:00Z`))) {
    throw new Error('Enter a valid preferred move-in date.');
  }
  if (body.termsAccepted !== true) throw new Error('Accept the application terms to continue.');
  return {
    propertySlug: readString(body.propertySlug, 'Property', 160),
    firstName: readString(body.firstName, 'First name', 100),
    lastName: readString(body.lastName, 'Last name', 100),
    email,
    phone: readString(body.phone, 'Phone', 32),
    currentAddress: readString(body.currentAddress, 'Current address', 500),
    employer: readString(body.employer, 'Employer', 200),
    monthlyHouseholdIncome: typeof body.monthlyHouseholdIncome === 'number' && Number.isFinite(body.monthlyHouseholdIncome) && body.monthlyHouseholdIncome >= 0
      ? body.monthlyHouseholdIncome
      : (() => { throw new Error('Enter a valid monthly household income.'); })(),
    desiredMoveInDate: moveInDate,
    householdSize: readInteger(body.householdSize, 'Household size', 1, 20),
    petsCount: readInteger(body.petsCount, 'Pet count', 0, 10),
    termsAccepted: true,
    website: typeof body.website === 'string' ? body.website.trim() : '',
    primaryPaymentMethod: typeof body.primaryPaymentMethod === 'string' && body.primaryPaymentMethod.trim()
      ? body.primaryPaymentMethod.trim().slice(0, 50)
      : 'Zelle',
    paymentHandle: typeof body.paymentHandle === 'string'
      ? body.paymentHandle.trim().slice(0, 100)
      : ''
  };
}

async function hashClientKey(clientKey: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(clientKey));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function supabaseRpc<T>(env: ApplicationApiEnvironment, procedure: string, args: Record<string, unknown>): Promise<T> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Application storage is not configured.');
  const url = new URL(`/rest/v1/rpc/${procedure}`, env.SUPABASE_URL);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(args)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof result?.message === 'string' ? result.message : 'Application database request failed.';
    throw new Error(message);
  }
  return result as T;
}

async function sendViaAppsScript(
  env: ApplicationApiEnvironment,
  to: string,
  eventKey: string,
  templateKey: EmailTemplateKey,
  values: Record<string, string>,
  approvedContent = false
): Promise<void> {
  if (!env.APPS_SCRIPT_WEB_APP_URL || !env.APPS_SCRIPT_SHARED_SECRET) throw new Error('Google Apps Script email delivery is not configured.');
  renderEmailTemplate(templateKey, values, { approvedContent });
  const response = await fetch(env.APPS_SCRIPT_WEB_APP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: env.APPS_SCRIPT_SHARED_SECRET,
      eventKey,
      templateKey,
      templateVersion: '1',
      to,
      values,
      approvedContent
    })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) throw new Error('Google Apps Script email delivery failed.');
}

export async function dispatchApplicationNotifications(env: ApplicationApiEnvironment, batchSize = 10): Promise<{ sent: number; retrying: number; failed: number }> {
  const jobs = await supabaseRpc<ApplicationNotification[]>(env, 'claim_application_notifications', { p_batch_size: batchSize });
  const result = { sent: 0, retrying: 0, failed: 0 };
  for (const job of jobs ?? []) {
    try {
      if (job.result_channel !== 'email') throw new Error('Unsupported notification channel.');
      if (job.result_template_version !== '1') throw new Error('Unsupported email template version.');
      const approvedContent = job.result_payload.approvedContent === 'true';
      await sendViaAppsScript(env, job.result_recipient_address, job.result_event_key, job.result_template_key, job.result_payload, approvedContent);
      await supabaseRpc(env, 'finish_application_notification', {
        p_notification_id: job.result_notification_id,
        p_status: 'sent',
        p_provider_message_id: null,
        p_error_code: null,
        p_retry_at: null
      });
      result.sent += 1;
    } catch {
      const isTerminal = job.result_attempt_count >= 5;
      const delayMinutes = Math.min(5 * (2 ** Math.max(0, job.result_attempt_count - 1)), 60);
      try {
        await supabaseRpc(env, 'finish_application_notification', {
          p_notification_id: job.result_notification_id,
          p_status: isTerminal ? 'failed' : 'retry',
          p_provider_message_id: null,
          p_error_code: 'apps_script_delivery_failed',
          p_retry_at: isTerminal ? null : new Date(Date.now() + delayMinutes * 60_000).toISOString()
        });
      } catch {
        // A claimed job is recovered by the database lease timeout if completion fails.
      }
      result[isTerminal ? 'failed' : 'retrying'] += 1;
    }
  }
  return result;
}

function constantTimeEqual(first: string, second: string): boolean {
  if (first.length !== second.length) return false;
  let mismatch = 0;
  for (let index = 0; index < first.length; index += 1) mismatch |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return mismatch === 0;
}

export async function handleApplicationNotificationDispatch(request: Request, env: ApplicationApiEnvironment): Promise<Response> {
  try {
    requireConfiguration(env);
  } catch {
    return jsonResponse(503, { error: 'Notification dispatch is not configured.' });
  }
  const authorization = request.headers.get('authorization') || '';
  const suppliedSecret = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!constantTimeEqual(suppliedSecret, env.APPLICATION_DISPATCH_SECRET!)) {
    return jsonResponse(401, { error: 'Unauthorized.' });
  }
  try {
    const result = await dispatchApplicationNotifications(env, 20);
    return jsonResponse(200, result);
  } catch {
    return jsonResponse(503, { error: 'Notification dispatch failed.' });
  }
}

export function resolveStaffReviewEmail(env: ApplicationApiEnvironment, marketSlug?: string): string {
  if (marketSlug && env.MARKET_REVIEW_EMAILS) {
    const custom = env.MARKET_REVIEW_EMAILS[marketSlug.toLowerCase()];
    if (custom) return custom;
  }
  return env.APPLICATION_REVIEW_EMAIL || '';
}

export async function generateApplicantMagicLoginUrl(
  env: ApplicationApiEnvironment,
  email: string,
  redirectTo: string
): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !email) return null;
  try {
    const adminEndpoint = new URL('/auth/v1/admin/generate_link', env.SUPABASE_URL);
    const response = await fetch(adminEndpoint, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'magiclink',
        email,
        options: {
          redirect_to: redirectTo
        }
      })
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.action_link || data?.properties?.action_link || null;
  } catch {
    return null;
  }
}

export async function handleApplicationStatusUpdate(request: Request, env: ApplicationApiEnvironment): Promise<Response> {
  try {
    requireConfiguration(env);
  } catch {
    return jsonResponse(503, { error: 'Application status update is not configured.' });
  }

  const authorization = request.headers.get('authorization') || '';
  const suppliedSecret = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!constantTimeEqual(suppliedSecret, env.APPLICATION_DISPATCH_SECRET!)) {
    return jsonResponse(401, { error: 'Unauthorized.' });
  }

  try {
    const raw = await readJson(request);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return jsonResponse(400, { error: 'Invalid status update request.' });
    }
    const body = raw as Record<string, unknown>;
    const applicationId = readString(body.applicationId, 'Application ID', 64);
    const currentStatus = readString(body.currentStatus, 'Current status', 32) as ApplicationStatus;
    const nextStatus = readString(body.nextStatus, 'Next status', 32) as ApplicationStatus;
    const staffId = typeof body.staffId === 'string' && body.staffId.trim() ? body.staffId.trim() : 'staff-system';
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    assertApplicationTransition(currentStatus, nextStatus);

    let persisted = false;
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabaseRpc(env, 'update_leasing_application_status', {
          p_application_id: applicationId,
          p_current_status: currentStatus,
          p_next_status: nextStatus,
          p_staff_id: staffId,
          p_note: note || null,
          p_reason: reason || null
        });
        persisted = true;
      } catch {
        persisted = false;
      }
    }

    return jsonResponse(200, {
      success: true,
      applicationId,
      previousStatus: currentStatus,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      persisted
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid transition.';
    return jsonResponse(400, { error: message });
  }
}

async function readJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_REQUEST_BYTES) throw new Error('Application request is too large.');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) throw new Error('Application request is too large.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Application request must be valid JSON.');
  }
}

function newVerificationToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function handleApplicationSubmission(request: Request, env: ApplicationApiEnvironment, clientKey: string): Promise<Response> {
  let config: ReturnType<typeof requireConfiguration>;
  try {
    config = requireConfiguration(env);
  } catch {
    return jsonResponse(503, { error: 'Application submission is temporarily unavailable.' });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== config.baseUrl.origin) return jsonResponse(403, { error: 'Request origin is not allowed.' });

  try {
    const clientKeyHash = await hashClientKey(clientKey, env.APPLICATION_RATE_LIMIT_SECRET!);
    const withinLimit = await supabaseRpc<boolean>(env, 'consume_application_submission_limit', {
      p_client_key_hash: clientKeyHash,
      p_limit: 5
    });
    if (!withinLimit) return jsonResponse(429, { error: 'Too many application attempts. Try again later.' });

    const submission = validateSubmission(await readJson(request));
    if (submission.website) return jsonResponse(202, { accepted: true });
    const submissionKey = request.headers.get('idempotency-key') || crypto.randomUUID();
    if (!/^[0-9a-f-]{36}$/i.test(submissionKey)) return jsonResponse(400, { error: 'Invalid submission key.' });

    const token = newVerificationToken();
    const tokenHash = await hashToken(token);
    const expiry = new Date(Date.now() + VERIFICATION_TTL_MS);
    const rows = await supabaseRpc<CreatedApplication[]>(env, 'create_public_leasing_application', {
      p_property_slug: submission.propertySlug,
      p_submission_key: submissionKey,
      p_token_hash: tokenHash,
      p_token_expires_at: expiry.toISOString(),
      p_terms_version: config.termsVersion,
      p_terms_accepted: submission.termsAccepted,
      p_first_name: submission.firstName,
      p_last_name: submission.lastName,
      p_email: submission.email,
      p_phone: submission.phone,
      p_current_address: submission.currentAddress,
      p_employer: submission.employer,
      p_monthly_household_income: submission.monthlyHouseholdIncome,
      p_desired_move_in_date: submission.desiredMoveInDate,
      p_household_size: submission.householdSize,
      p_pets_count: submission.petsCount
    });
    const application = rows[0];
    if (!application?.result_reference_code) throw new Error('Application could not be created.');

    const verificationUrl = new URL('/api/applications/verify', config.baseUrl);
    verificationUrl.searchParams.set('token', token);
    try {
      await sendViaAppsScript(env, application.result_email, `application.verify:${application.result_application_id}`, 'application.verify_email', {
        firstName: application.result_first_name,
        propertyAddress: `${application.result_property_address}, ${application.result_city}`,
        expiresAt: expiry.toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' }),
        portalUrl: verificationUrl.toString(),
        supportContact: env.APPLICATION_SUPPORT_EMAIL || 'resident support'
      });
    } catch {
      return jsonResponse(503, { error: 'Your application was saved, but verification email could not be sent. Retry using this same form shortly.', referenceCode: application.result_reference_code });
    }

    return jsonResponse(202, { accepted: true, referenceCode: application.result_reference_code, email: application.result_email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Application submission failed.';
    const knownClientError = /required|valid|between|whole number|accept|too large|JSON|currently accepting|already been submitted|submission key/i.test(message);
    return jsonResponse(knownClientError ? 400 : 500, { error: knownClientError ? message : 'Application submission failed. Try again later.' });
  }
}

function verificationPage(token: string, baseUrl: URL): Response {
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
  const action = new URL('/api/applications/verify', baseUrl).toString();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>Verify your application email</title></head><body><main><h1>Verify your email address</h1><p>Confirm your email to submit this application. This link can only be used once.</p><form method="post" action="${escape(action)}"><input type="hidden" name="token" value="${escape(token)}"><button type="submit">Verify email and submit application</button></form></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }
  });
}

export async function handleApplicationVerification(request: Request, env: ApplicationApiEnvironment): Promise<Response> {
  try {
    const config = requireConfiguration(env);
    const token = new URL(request.url).searchParams.get('token') || '';
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return htmlStatus(400, 'Invalid verification link', 'Request a new application verification email and try again.');
    return verificationPage(token, config.baseUrl);
  } catch {
    return htmlStatus(503, 'Application service unavailable', 'Please try again later or contact the leasing team for assistance.');
  }
}

export async function handleApplicationVerificationConfirmation(request: Request, env: ApplicationApiEnvironment): Promise<Response> {
  try {
    const config = requireConfiguration(env);
    const origin = request.headers.get('origin');
    if (origin && origin !== config.baseUrl.origin) return htmlStatus(403, 'Request not accepted', 'Open the verification link from the email and try again.');
    const form = await request.formData();
    const token = String(form.get('token') || '');
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return htmlStatus(400, 'Invalid verification link', 'Request a new application verification email and try again.');
    const tokenHash = await hashToken(token);
    const rows = await supabaseRpc<VerifiedApplication[]>(env, 'verify_public_leasing_application', {
      p_token_hash: tokenHash,
      p_application_base_url: config.baseUrl.toString(),
      p_support_email: env.APPLICATION_SUPPORT_EMAIL!,
      p_review_email: env.APPLICATION_REVIEW_EMAIL!
    });
    const application = rows[0];
    if (!application?.result_reference_code) return htmlStatus(410, 'Verification link expired', 'Start a new application or contact the leasing team for help.');

    let delivery;
    try {
      delivery = await dispatchApplicationNotifications(env, 10);
    } catch {
      delivery = { sent: 0, retrying: 0, failed: 0 };
    }
    return htmlStatus(200, 'Application submitted', delivery.sent === 2
      ? 'Your email is verified and your application has been submitted. Confirmation emails have been sent to you and the leasing team.'
      : 'Your email is verified and your application has been submitted. Confirmation emails are queued for delivery.', application.result_reference_code);
  } catch {
    return htmlStatus(503, 'Application service unavailable', 'Please try again later or contact the leasing team for assistance.');
  }
}

function htmlStatus(status: number, title: string, message: string, reference?: string): Response {
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] ?? character);
  const referenceMarkup = reference ? `<p>Application reference: <strong>${escape(reference)}</strong></p>` : '';
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title></head><body><main><h1>${escape(title)}</h1><p>${escape(message)}</p>${referenceMarkup}<a href="/search/houses-for-rent">Return to home search</a></main></body></html>`, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
