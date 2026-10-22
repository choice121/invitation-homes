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

**Confirmed operating decision:** first release uses manual, staff-recorded
payment and screening steps only. The site will not process payments or conduct
screening. Every manual confirmation must be attributed to an authorized staff
user, record the evidence/reference reviewed, and be distinguishable from a
provider-confirmed event.

**Do not interpret this document as approval to change production data, send
real applicant communications, collect real payments, conduct screening, or
publish imported listings.** Those actions require approved policies,
credentials, permissions, and a staging sign-off.

## Current Handoff Status

- This is a documentation-first handoff. No Choice code, property records,
  applicant records, tenant records, or production credentials have been
  imported into this project.
- The user asked to publish this handoff to the Invitation Homes GitHub
  repository before feature implementation continues.
- The next agent must verify the published handoff, complete Phase 0 discovery,
  and record the full source-to-target mapping before starting integration
  implementation.
- The first-release operating model is decided: staff may record manual payment
  and screening actions; the app must not process money or claim to run a
  screening check.

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
9. Manual payment/screening records are approved for the first release. The
   actual allowed payment methods, screening criteria, notices, and evidence
   requirements still need Invitation Homes policy approval.

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

## Choice Source Capability Inventory

This is the discovered top-level capability map, not permission to copy code or
policies blindly. During Phase 0, re-open the current Choice source and add the
exact source file/function, table, job, and permission mapping for each row.

| Capability | What the source project contains | Target treatment |
|---|---|---|
| Property collection | Python pipeline and source-specific listing extractors, including an Invitation Homes browser-extension extractor | Revalidate each source, access method, and terms; implement only an approved source adapter |
| Browser-assisted imports | Chrome extension that extracts listing details and images from a supported page | Adapt only after source/page authorization, data provenance, and user review controls are defined |
| Admin URL imports | Staff-oriented listing intake and review path | Stage records; validate, deduplicate, audit, and explicitly publish |
| Listing enrichment | Normalization, competitor/source filtering, image handling, and validation rules | Map each rule separately; Choice's competitor rules can exclude Invitation Homes listings |
| Applications | Applicant queue, application statuses, review actions, and communication/document handling | Use the existing Invitation Homes application source of truth; retain email verification and add staff authorization |
| Payment coordination | Staff-entered fee and holding-payment status, including paid/unpaid/waived/refunded actions | Manual records only; no Choice-specific payment rail, amount, fee, or wording without approval |
| Screening coordination | Staff-entered screening workflow and decision tracking | Manual review record only; no consumer-report order or automated screening claim |
| Leasing and move-in | Lease, move-in, and related administrative records/actions | Map to existing leasing models; keep legal documents and signatures protected |
| Property operations | Inspection and deposit accounting workflows | Adapt only after Invitation Homes policy, role, and accounting rules are confirmed |
| People and communications | Landlord, message, and email-log tools | Map business ownership, access scopes, delivery/retry behavior, and audit requirements |
| Governance tools | Audit, state-law, and watermark-related operations | Rebuild only where the tool and policy apply to Invitation Homes; do not import Choice legal rules |

### Choice runtime and infrastructure

The source is not a single app that can be copied into this React project. It
combines a static HTML/JavaScript admin experience, Cloudflare Pages Functions,
Supabase Edge Functions and PostgreSQL, Python ingestion jobs, and a Chrome
extension. Phase 0 must inventory these boundaries explicitly, including:

- UI routes, roles, and actions
- Edge/Pages functions and their request/response contracts
- Tables, views, RPCs, triggers, RLS policies, storage buckets, and scheduled
  jobs
- Pipeline stages, retry/idempotency behavior, provenance, image processing,
  and deduplication
- Required environment-variable **names** and which service owns each one; do
  not copy or reveal any secret values
- External services, source endpoints, operational permissions, and source
  terms

The checked-in Choice migrations are only partial schema deltas, not a safe
standalone schema baseline. Request or create a reviewed schema inventory before
porting a function that depends on Choice tables.

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
building the general technical framework. The first release's manual-record
approach is already approved; the following details remain open:

1. Which manual payment methods, evidence, approval roles, and refund controls
   are allowed.
2. Which screening criteria, review controls, and required notices apply to
   manually recorded screening decisions.
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

### Immediate next-agent instructions

1. Check the GitHub target repository and verify that this handoff and the
   README link are present. If not, finish the documentation-only push first.
2. Check `git status`, current branch, remotes, and recent commits. Never push
   unrelated changes or credentials.
3. Revalidate Choice `main` and record the current commit before relying on the
   audited snapshot above.
4. Produce a source map that lists every admin route, importer, scraper/job,
   extension flow, database object, status, manual action, permission, and
   external dependency discovered. Include file paths and line/function
   references so a later agent can find each item.
5. Create the field/status/role mapping to Invitation Homes and label every
   Choice behavior `port`, `adapt`, `replace`, or `exclude`, with a reason.
6. Review this project's current migrations, RLS, API routes, and UI against
   that map. Resolve ownership and security gaps before adding new tables or
   endpoints.
7. Update this handoff and the source map with findings, test results, and the
   exact next implementation slice. Do not claim the full platform is ready
   from documentation, a build, or a visual-only test.

Implementation work should use focused commits and staging verification. Push
only the intended project changes to the Invitation Homes repository. Do not
push to the Choice repository or modify its production systems unless the user
explicitly requests that separate work.

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
