# Google Apps Script Email Delivery

Status: implementation included; deployment/configuration has not been completed because this workspace has no Supabase or Apps Script credentials.

## Files and Flow

- `apps-script/Code.gs` contains the Google Apps Script web app, all 40 versioned subject/body templates, HTML escaping, link validation, sensitive-content gates, shared-secret check, and event-key duplicate suppression.
- `src/services/emailTemplates.ts` is the application-side template schema and renderer used to validate payloads before sending.
- `src/services/applicationApi.ts` sends template keys and data to Apps Script from server-side code. It never calls an email API from the browser and never sends the Supabase service-role key to Apps Script.
- The application flow currently triggers `application.verify_email`, `application.submitted`, and `application.staff_submitted`. The other catalog entries are implemented and available, but no workflow triggers them yet.

## Deploy the Script

1. Create a Google Apps Script project owned by the authorized Google Workspace account that should send the messages.
2. Copy `apps-script/Code.gs` into the script project.
3. In **Project Settings → Script Properties**, set:
   - `APP_EMAIL_SHARED_SECRET`: a random secret at least 32 characters long; use the exact same value in the app's server-only environment.
   - `SENDER_NAME`: approved sender display name.
   - `SENDER_EMAIL_ALIAS`: optional verified Gmail/Workspace send-as alias. If omitted, Gmail sends from the account that owns the script.
   - `REPLY_TO`: monitored, approved reply-to address.
4. Deploy as a **Web app**, execute as the authorized Workspace account, and allow access to anyone. The endpoint is public by design; the shared secret is its application-level authentication. Never put that secret in browser code.
5. Copy the deployed `https://script.google.com/macros/s/.../exec` URL into the server-only `APPS_SCRIPT_WEB_APP_URL` setting. Set `APPS_SCRIPT_SHARED_SECRET`, `APPLICATION_SUPPORT_EMAIL`, and `APPLICATION_REVIEW_EMAIL` in the application runtime as well.
6. Re-deploy the Apps Script web app whenever its code changes, and update the configured URL if Google creates a new deployment.

The application also requires server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APPLICATION_BASE_URL`, and `APPLICATION_RATE_LIMIT_SECRET`. `APPLICATION_BASE_URL` must be the HTTPS site origin. Never prefix these secrets with `VITE_`, commit real values, or return them to a client.

## Sender Authentication and Deliverability

No implementation can guarantee that a message never reaches spam. Inbox placement is controlled by Google, recipient providers, domain reputation, user engagement, message content, and policy enforcement. Reduce risk by:

- Use an authorized Google Workspace account on a domain you control. Verify the sender and configure any send-as alias in Workspace/Gmail.
- Publish the exact SPF and DKIM records shown by Google Workspace Admin for that sending domain. Do not replace existing SPF records; combine authorized senders into one valid SPF record.
- Publish a DMARC record aligned with the visible From domain. Start with the domain owner's approved monitoring policy, review aggregate reports, then tighten enforcement deliberately.
- Keep From, DKIM signing domain, and links aligned with the authorized domain. Use HTTPS links, accurate subjects, recognizable sender identity, valid reply-to, and plain-text alternatives.
- Send only expected transactional messages to the address provided by the applicant. Do not add marketing without separate consent. Honor complaints, bounces, and opt-outs where required.
- Test with real recipient providers, monitor bounces/complaints and Gmail Postmaster Tools where available, and ramp volume gradually. Google Apps Script/Gmail sending quotas apply and are not a high-volume transactional guarantee.

Use current Google Workspace Admin values and your domain administrator's approval; this repository cannot publish or verify DNS records.

## Failure and Retry Behavior

The submission endpoint keeps the application as a draft if the verification email send fails and returns a retryable response. The email script caches successful event keys to reduce duplicate sends. It currently does not provide durable delivery logs or a scheduled retry worker. The post-verification confirmation and staff notification are best-effort sends; the application remains submitted if either fails. Add a durable outbox worker and staff-visible retry queue before treating mail delivery as a production service-level guarantee.

## Validation

`npm test` includes mocked Apps Script HTTP tests for verification, applicant confirmation, staff notification, rate-limit denial, and template rendering. Tests do not send real mail. Before launch, deploy a staging script, configure server-side staging variables, submit to controlled mailboxes, verify the script's sender alias and DNS authentication, and confirm application rows/events in a staging Supabase project.
