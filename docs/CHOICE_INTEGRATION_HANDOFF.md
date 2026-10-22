# Choice Integration and Agent Handoff

## Purpose

This is the working source of truth for integrating the workflows from
[choice121/Choice](https://github.com/choice121/Choice) into this Invitation
Homes project. It is intended to let another engineer or AI continue without
repeating discovery or guessing at decisions.

The user wants this project to gain Choice-style property importing, staff
operations, applications, and tenant workflows, while **not copying Choice
property records**. The user also wants a usable manual operating workflow
instead of blocking on payment or screening provider integrations.

**Do not interpret this document as approval to change production data, send
real applicant communications, collect real payments, conduct screening, or
publish imported listings.** Those actions require approved policies,
credentials, permissions, and a staging sign-off.

## Source Snapshot and Revalidation

- Source repository: `https://github.com/choice121/Choice`
- Audited source branch: `main`
- Audited source commit: `09a2a14b4a78d67c6b4ced887fb7473612fac8dc`
- Re-check the source branch before implementing. Do not assume it is unchanged.
- Current project: Invitation Homes renter experience in this repository.
- Current project runtime: React, TypeScript, Vite, Express, and Supabase.

The source repository is accessible for code inspection. Repository access does
not by itself grant access to its GitHub secrets, Supabase production data,
Cloudflare settings, email account, or third-party provider accounts.

## Operating Rules

1. Keep this app's existing React/Vite/Express structure and current Supabase
   project unless the user explicitly approves a change.
2. Extend the existing database with reviewed, additive migrations. Do not
   replace its database or create a second application source of truth.
3. Do not import Choice property, applicant, tenant, payment, or lease records.
   Use synthetic records in a staging environment for integration tests.
4. Keep the Invitation Homes public branding, approved copy, prices, fees,
   screening criteria, notices, lease language, and market rules. Choice's
   implementation is a workflow reference, not automatic approval of its
   business or legal policies.
5. Keep service-role keys, import secrets, email relay secrets, and provider
   credentials server-side in approved secret storage. Never put secrets in
   browser bundles, URLs, committed files, or a shared credentials database.
6. Default property imports to a review queue. Do not automatically publish,
   rewrite real addresses, change source locations, or fabricate listing
   details.
7. Treat a staff-entered payment or screening status as a staff assertion, not
   as provider verification. Record who entered it, when, and what evidence or
   reference they reviewed.
8. Never claim an action is complete unless it has been verified against the
   relevant role, state, and error path.

## Architecture Comparison

| Area | Choice source | This project | Integration direction |
|---|---|---|---|
| Public web app | Static HTML/JavaScript, Cloudflare Pages | React/Vite/TypeScript with Express/Vite | Rebuild product flows in the current app; do not replace its frontend runtime |
| Server actions | Cloudflare Pages Functions and Supabase Edge Functions | Express routes plus Supabase | Keep privileged operations server-side; choose Express or Edge Function per operation and document the boundary |
| Database | Existing Choice Supabase schema | Existing Invitation Homes Supabase schema | Map fields and states first; apply additive migrations only |
| Bulk intake | Python pipeline, HomeHarvest, Zillow/other source-specific jobs | Existing authorized inventory sync and public property repository | Port approved source adapters into an isolated job/staging flow |
| One-off intake | Admin URL import and browser extension | No complete review-first admin pipeline yet | Port staging, provenance, deduplication, and manual review |
| Application data | Choice `applications` and related operations | Existing `leasing_applications`, contact, consent, event, and notification records | Use one canonical target application model; do not create parallel active records |
| Admin UI | Separate static admin pages | Staff application screen and early workflow UI | Implement secured React admin workflows with role checks and audit history |

## Findings That Must Not Be Lost

### Property ingestion

Choice documents Python bulk intake, a Chrome extension, an admin URL importer,
and other portal-specific paths. Its repository has an Invitation Homes
extractor in the browser extension. However, Choice's scraper enrichment rules
also classify Invitation Homes as a competitor and can discard those records.
The bulk-pipeline documentation does not establish an Invitation Homes bulk
adapter. Confirm the intended authorized Invitation Homes source and build the
appropriate adapter; do not assume the extension extractor makes the bulk
pipeline work.

Choice's README and pipeline documentation also disagree about image review,
photo-count rules, and image hosting. Resolve these differences against
approved Invitation Homes requirements before porting a rule.

### Applications and manual operations

Choice's application admin has application status actions, payment status
actions (including paid, unpaid, waived, and refunded), holding-fee actions,
notifications, and document review. Its application UI describes coordinating
the fee outside the application and then recording a staff update.

This supports a Choice-style manual workflow without a payment API:

1. Staff records an external/manual payment as reported.
2. An authorized staff member verifies the evidence and records a confirmation,
   amount, method, date, and reference.
3. The application status changes only through an allowed transition and the
   action is audited.
4. The applicant receives only the approved notification.

This is **not** payment processing, settlement, refund execution, or
independent verification. Those must not be represented as automated.

Similarly, manual screening can track a staff-entered review state and
decision. It does not order a consumer report or perform a background check.
Preserve any required notices, decision criteria, permissions, and audit
requirements approved by Invitation Homes.

Choice documents describe payment coordination methods and financial rules
that are specific to Choice. Do not copy the payment rails, amounts, or
resident-facing financial/legal language into Invitation Homes without explicit
business and legal approval.

### Current project gaps and existing work

- The current project already has public property search/detail pages, a
  hosted-Supabase inventory model, and email-verified application intake.
- The staff applications screen initializes sample rows and can retain them
  when the live query is empty or fails. This must be removed from any
  production staff workflow; failures should be shown explicitly.
- The status-update endpoint requires server authorization, but the current
  browser request does not provide the required authorization header. Replace
  this with authenticated, role-scoped staff APIs; do not expose a shared
  browser secret.
- Tenant and leasing workflow screens include local/browser-only behavior.
  Local state is not proof that the corresponding operational workflow is
  persisted or live.
- The current implementation-status document contains conflicting descriptions
  of staff review work. Update it as implementation proceeds, and use this
  handoff document for integration scope and decisions.
- Choice's checked-in Supabase migrations are not a complete standalone
  database baseline. Obtain an authorized schema export or reconstruct and
  review all required tables, RPCs, triggers, policies, buckets, and indexes
  before relying on production behavior.

## Feature Coverage Checklist

Track each item as `Not started`, `In progress`, `Verified in staging`, or
`Production enabled`. A screen without its secured server behavior does not
count as done.

### Property pipeline

- [ ] Approved sources and allowed collection methods documented
- [ ] Source-specific extractors and import adapters
- [ ] Import authentication, rate limits, idempotency, and provenance
- [ ] Staging records and duplicate detection
- [ ] Staff review/edit, publish, archive, bulk actions, and audit events
- [ ] Photo validation, retry, ordering, storage, and failure visibility
- [ ] Transactional publish into the existing public inventory model
- [ ] No Choice listing rows transferred

### Staff operations

- [ ] Staff sign-in, role provisioning, least-privilege authorization
- [ ] Dashboard, filters, search, queues, and empty/error states
- [ ] Application review and status transitions
- [ ] Manual fee and holding-payment record/verification with audit evidence
- [ ] Manual screening state and decision record
- [ ] Applicant messages and delivery history
- [ ] Listing and property-detail operations
- [ ] Lease, move-in, inspection, deposit, landlord, and message operations
- [ ] Email logs, audit log, and operational exception queues
- [ ] No fixture/sample applicant records in production views

### Applicant and resident experience

- [ ] Approved multi-step application fields and validation
- [ ] Email verification and versioned terms/consents
- [ ] Save/resume with expiring, non-guessable tokens
- [ ] Private document upload/download permissions and retention
- [ ] Applicant status view and safe notification links
- [ ] Manual payment instructions and receipts only if approved
- [ ] Screening and adverse-action communications only with approved rules
- [ ] Lease review/signature states and document access
- [ ] Move-in, maintenance, renewal, move-out, and deposit history
- [ ] Co-applicant and household workflows where approved

## Phased Implementation Order

### Phase 0 — Freeze the integration contract

- Refresh the Choice source snapshot and inventory all screens, operations,
  statuses, schemas, functions, jobs, and required secrets by name only.
- Build a field-and-status mapping between the Choice workflow and this app.
- Mark each Choice behavior as `port`, `adapt`, `replace`, or `exclude`.
- Record approved Invitation Homes policy decisions separately from source
  code behavior.

**Exit condition:** No ambiguous table ownership, status mapping, or data-transfer
scope remains.

### Phase 1 — Secure foundations and database model

- Use the current project's Supabase project and existing property/application
  models.
- Add or adapt private staging, staff-role, audit, screening-review,
  payment-record, and operational workflow data as needed.
- Define RLS and server-only mutation paths; review storage access for applicant
  documents and lease files.
- Keep workflow changes append-only/auditable where appropriate.
- Validate migrations in a disposable staging project before any production
  application.

**Exit condition:** Anonymous and ordinary applicant roles cannot access staff
or other applicants' private data; authorized staff actions are attributable.

### Phase 2 — Import and review pipeline

- Port only approved extractors and ingestion channels.
- Enforce idempotency, provenance, validation, deduplication, and staging.
- Implement the manual review queue and explicit publish path.
- Test with synthetic listings; verify that no Choice inventory was copied.

**Exit condition:** An authorized synthetic listing can be staged, reviewed,
published to the existing public inventory model, archived, and audited.

### Phase 3 — Application and staff review

- Adapt the Choice-style multi-step application to the current application
  backend and retain the current server-enforced email verification unless
  explicitly changed.
- Replace sample fallback data and the shared-secret status path with
  authenticated staff APIs.
- Implement application status, manual payment, manual screening, document,
  notification, and audit workflows.
- Keep one canonical application record and reconcile old/duplicate states.

**Exit condition:** Synthetic applicant flows can be submitted, verified,
reviewed, manually updated, notified, and audited from end to end.

### Phase 4 — Lease and resident operations

- Port the admin and resident actions for leases, move-ins, inspections,
  deposits, messages, maintenance, renewals, and move-outs.
- For the no-provider version, explicitly distinguish manual staff records from
  provider-confirmed payment or signature events.
- Protect legal documents and resident access data with role/relationship
  authorization.

**Exit condition:** Each approved manual workflow persists, enforces its state
rules, and has an operator runbook.

### Phase 5 — Production readiness

- Complete security, privacy, accessibility, and mobile checks.
- Run role-by-role end-to-end tests against staging and controlled test
  mailboxes.
- Verify backup/restore, retry, duplicate-event, outage, audit, and rollback
  paths.
- Review all resident-facing policy, fee, payment, and screening language with
  the designated Invitation Homes owners.
- Enable production actions only after explicit release approval.

**Exit condition:** Every item in the feature checklist has a verified state;
manual-only functions are labeled as manual and no unsupported provider
capability is implied.

## Decisions Still Needed

These decisions are blockers for production policy, not for documenting or
building the general technical framework:

1. Whether Choice's manual payment-entry pattern is approved for Invitation
   Homes, and which payment instructions, evidence, and staff roles are allowed.
2. Whether screening is to be recorded as a manually completed external process,
   and which criteria, review controls, and notices apply.
3. Invitation Homes-approved fees, deposits, holding terms, refunds, lease
   language, communications, and document retention.
4. Which official or otherwise authorized sources may feed property imports.
5. The approved staff identity/role provisioning process.
6. The designated staging Supabase environment and release approver.

Do not put credentials or applicant/property data into this document. Configure
secrets through the workspace and provider secret-management tools.

## Handoff Protocol for Any Agent

Before making changes:

1. Read this document, the root `README.md`, `docs/IMPLEMENTATION_STATUS.md`,
   and `docs/TENANT_LEASING_WORKFLOW.md`.
2. Check the current Git state and current project task assignment.
3. Revalidate any source behavior against the current Choice repository; use
   this guide for settled project decisions, not as a substitute for checking
   code that may have changed.
4. Identify the exact checklist item being implemented and its prerequisites.
5. Do not start a scraper, publish records, send applicant communications,
   alter payment status, or touch production data during discovery.

Before stopping or handing off:

1. Update the checklist and phase status accurately.
2. Record files changed, commands/checks run, and results.
3. Record unresolved failures, policy decisions, and the exact next step.
4. Never mark a phase complete based only on UI appearance or a successful build.

### Work log

Append one concise entry per completed implementation batch:

```text
Date:
Phase/checklist items:
Files changed:
Database changes and environment:
Verification performed and result:
Open issues / decisions:
Next exact step:
```
