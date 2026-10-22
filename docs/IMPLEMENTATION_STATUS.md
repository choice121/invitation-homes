# Implementation Status

Last updated: 2026-10-21

This page is the current at-a-glance status. The [Project Guide](PROJECT_GUIDE.md) explains the public app and inventory; the [Tenant Leasing Workflow](TENANT_LEASING_WORKFLOW.md) describes the tenant lifecycle, local workflow, and production integration boundary.

## Done

- Active React/Vite public renter experience: homepage, search/market routes, property detail, renter guides, and public inventory reads.
- Hosted Supabase inventory and search migrations 1-4, including RLS-protected public listing reads and saved-property/search tables.
- Authorized inventory importer and a documented 60-listing pilot across 20 markets.
- Local-only workflow schema covering applications, participants/consents, staff memberships, offers/holds, screening cases and required notices, payment ledger/allocations, security-deposit receipt/disposition, lease documents/signers/events, renewals, resident service requests, and notification outbox/delivery attempts.
- Pure workflow guards for screening/application transitions, offer eligibility, confirmed holding payments, provider-confirmed lease execution, security-deposit receipt, and final deposit reconciliation.
- Browser-local `/tenant-workflow` covering application entry, screening state, holding terms, lease review, security deposit, move-in checklist, maintenance request/status, renewal choice, move-out notice/checklist, deposit disposition, and an activity feed. It loads the selected public listing and stores workflow progress in the current browser tab.
- Server-side email-verified application intake at `/apply/:propertySlug`: validates public property eligibility and fields, records versioned terms consent and an audit event, stores the application as a draft, then submits it only after an explicit one-time email verification POST.
- Apps Script email bridge and 40 matching versioned email templates in TypeScript and `apps-script/Code.gs`, with HTML escaping, HTTPS links, event-key duplicate suppression, staff review notification, and legal-content gates.
- Transactional outbox claim/completion functions and an authenticated dispatcher endpoint for retryable post-submission applicant/staff notifications.
- Leasing workflow specification with tenant lifecycle, status models, holding-fee safeguards, notification catalog, implementation sequence, and acceptance gates.
- Append-only table grants for captured application consents, application events, and notification delivery attempts. No browser roles have grants on the new leasing tables.
- `npm run lint`, all 34 unit tests, and `npm run build` pass cleanly with zero warnings.
- The search view map uses Leaflet with keyless OpenStreetMap tiles. No map API key, billing account, or paid tier is required. `VITE_MAP_TILE_URL` and `VITE_MAP_TILE_ATTRIBUTION` are optional overrides for a dedicated tile provider.
- `npm run visual:capture` runs in this container and reports no page errors, console errors, or failed requests for the local homepage at desktop and mobile widths.
- Internal administrative status update endpoint at `POST /api/internal/applications/:id/status` (and Cloudflare Pages function) guarded by `APPLICATION_DISPATCH_SECRET` that enforces domain transitions via `assertApplicationTransition` and records audit events.
- Staff Review Dashboard at `/staff/applications` (and `/admin/applications`) providing application search, status filtering, applicant profile details, and one-click transitions through screening, review, approval, and denial.
- Hosted Supabase database integration: Migration `20261021000006_add_public_application_intake.sql` was applied and verified against the live hosted project (`poqgtsltsziuwvzskgth`). Public intake RPCs (`create_public_leasing_application`, `verify_public_leasing_application`, `claim_application_notifications`, `finish_application_notification`, and rate limiting) are live.
- `npm run test:supabase` integration test verified against the live linked database with transaction rollback.
- Optional one-click applicant magic-login link generation (`generateApplicantMagicLoginUrl`) using Supabase Auth Admin to drop applicants straight into the portal upon email confirmation.
- Regional market email routing (`resolveStaffReviewEmail`) with optional `MARKET_REVIEW_EMAILS` map, defaulting cleanly to `APPLICATION_REVIEW_EMAIL`.

## Local Only

- Browser-local workflow transitions use session storage as a fallback when offline. With the live Supabase project connected, intake tables and RPCs are active.
- The Apps Script source is ready in `apps-script/Code.gs`; live Gmail delivery requires deploying the script and setting `APPS_SCRIPT_WEB_APP_URL`.

## Blocked

- Local migration lint/integration test: `supabase start` and `supabase db start` fail during the internal Realtime migration with a Postgres connection timeout. Postgres reports healthy, the expected `supabase_admin` role exists, but Realtime does not establish a session before the CLI tears down the local containers. The new project migration has therefore not been validated by a running local database.
- Production application intake: requires server secrets configured, Google Apps Script deployed with a restricted shared secret, and the notification dispatcher scheduled.
- Operational decision: Payment tracking and tenant screening operate permanently on manual staff verification (Zelle, Venmo, Cash App, Card, ACH receipts) with audit references and logging. Third-party automated payment APIs and screening provider integrations are permanently excluded.

## Completed Integrations & Tools

- Staff Operations Console (`/staff/portal`) with Dashboard metrics, Applications review, Manual Payment recording modal, Listings Pipeline with Cheerio web scraping, Leases manager, Inspections reviewer, and Audit Ledger.
- Tenant Resident Portal (`/tenant/portal`) with Magic Link / email verification lookup, active lease review, move-in room condition inspection form, holding deposit ledger, and ProCare maintenance request dispatch.
- Packaged Chrome Extension (`invitation-homes-importer.zip`) for 1-click listing imports from Zillow, Realtor.com, Redfin, etc. into the staff staging queue.

## Decisions Needed

- Choose backend runtime for authenticated workflows. Cloudflare Pages serves the static frontend only; Supabase Edge Functions or a separately hosted API are candidates.
- Choose/approve application, screening, payment, e-signature, tour, email/SMS, and resident-service providers.
- Approve market-specific application consent, holding fee/deposit classification, refund/credit rules, deadlines, notices, screening criteria, lease terms, and data retention with the responsible business/legal owners.
- Decide whether this remains an authorized public-site backup with external service handoffs or becomes an operational leasing product. Do not imply the latter until its systems and authorization are in place.

## Recommended Next Sequence

1. Apply and lint migrations 5-7 in a disposable staging Supabase project; verify RLS and service-role grants.
2. Deploy `apps-script/Code.gs`, configure Script Properties and an authorized sender alias, set server-only environment variables, and schedule the notification dispatcher.
3. Test application submission and email verification with controlled mailboxes, retries, duplicate requests, rate limits, expired tokens, unavailable Apps Script, and staff notifications.
4. Add a staff review interface and applicant status access before describing application processing as end-to-end.
5. Connect screening, payment, and e-signature providers only after approved policies and sandbox testing; do not enable live charges or decisions from the browser workflow.
5. Update this status page in the same change as each feature, marking it done only after its tests and deployment/environment requirements are verified.