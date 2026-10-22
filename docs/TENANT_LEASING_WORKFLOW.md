# Tenant Leasing and Resident Workflow

Status: browser-local tenant journey and private schema/domain foundation. The `/tenant-workflow` route covers application, screening state, holding terms, lease review, security deposit, move-in, maintenance, renewal, move-out, deposit disposition, and local activity notifications. Progress is stored in the browser tab. It is not an authenticated account or authoritative transaction record, and it does not execute screening, reservation, payments/refunds, lease signing, maintenance dispatch, or notices. Private schema migrations are local-only and have not been applied to the linked database.

## Product Boundary

The active app is a public home-search experience. Its Apply Now action links to the official application URL when inventory provides one, and otherwise links to an informational guide. The separate tenant workflow is local-only. Public fee/holding copy is informative and does not itself provide a current property-specific transaction instruction; live charging, reservation, screening, or lease decisions must use the applicable approved policy and property terms.

Before implementing real leasing, the business owner must decide whether this product links to authorized existing services or integrates with contracted providers. Obtain written authorization, policies, provider sandbox access, operational ownership, and counsel review. Keep the production boundary explicit until those conditions are met.

## Lifecycle

1. **Discover:** Publish current homes, availability, rent, fees, disclosures, pet rules, and approved tour options. Display when the feed was last confirmed. Prevent a new application from proceeding when inventory is no longer eligible.
2. **Tour:** Request, confirm, reschedule, or cancel a tour through the approved scheduling provider. Send reminders. Access credentials must be short-lived, issued through the approved access system, and never included in public inventory or ordinary email/SMS.
3. **Apply:** Authenticate the applicant, verify contact information, identify each adult applicant and occupant, disclose fees, capture versioned consents, and submit the application. Collect only fields required by the approved process.
4. **Screen and review:** Conduct manual staff screening and review. Track reviewer staff identity, verification notes, and decision. Store no raw SSN or unapproved identity-document images in general application JSON. Automated screening provider APIs are permanently excluded.
5. **Offer and hold:** Revalidate home availability. Issue versioned, property-specific lease and holding terms with an exact expiry timestamp and timezone. Accept the terms before recording hold deposit verification. Reserve the home transactionally so only one active hold can exist.
6. **Lease:** Generate the jurisdiction/property-specific document package from approved terms, collect each required signature, and record countersignatures. Mark executed only after all required signers and countersignatures are complete. Keep final documents in approved protected storage.
7. **Move-in:** Verify the balance from the executed lease and manual payment ledger (Zelle, Venmo, Cash App, Card, ACH receipts), complete move-in inspection tasks, create resident access, and send move-in instructions. Do not send access credentials in email.
8. **Residency:** Provide a resident account, rent and payment history, household/contact maintenance, maintenance request submission, scheduling/status updates, emergency escalation, and resident notices. Confirm active lease membership before exposing property-specific data.
9. **Renewal:** Create a separate versioned renewal offer with terms, deadline, response, and signature tracking. Do not model a renewal as a new application.
10. **Move-out:** Record notice, dates, inspection, key/access return, final account, charges, deposit disposition, forwarding address, and required notices. Calculate deadlines and itemization rules from approved local policy.

## State Models

Application status is independent from property availability, offer status, hold status, payment status, and lease status. Do not use a single status field to represent the whole transaction.

| Record | States in the foundation | Notes |
|---|---|---|
| Application | `draft`, `submitted`, `identity_verification`, `screening`, `information_requested`, `under_review`, `approved`, `conditionally_approved`, `denied`, `withdrawn`, `expired` | Status changes must be performed by trusted server-side workflows, with actor, timestamp, and event history. |
| Applicant participant | `invited`, `started`, `submitted`, `withdrawn` | A household can have separate adult applicants and occupants. |
| Initial offer | `draft`, `issued`, `accepted`, `declined`, `expired`, `withdrawn`, `converted` | Snapshot the exact offer terms and version shown to the applicant. |
| Property hold | `payment_pending`, `active`, `released`, `expired`, `converted`, `refund_pending`, `refunded` | Expiration jobs must move expired rows out of active statuses before another hold can be created. |
| Payment ledger entry | `pending`, `processing`, `succeeded`, `failed`, `cancelled`, `reversed` | Browser return URLs are not payment confirmation; verify provider webhooks. Refunds/reversals are separate linked entries. |
| Lease | `draft`, `offered`, `partially_signed`, `executed`, `active`, `ended`, `void` | `executed` only after all required signers complete. `active` follows the approved effective/start-date rule. |
| Renewal offer | `draft`, `issued`, `accepted`, `declined`, `expired`, `withdrawn`, `converted` | Linked to the existing lease and its versioned renewal terms. |
| Resident request | `submitted`, `triaged`, `scheduled`, `in_progress`, `waiting`, `completed`, `cancelled` | Emergency requests need a separate immediate escalation path and clear confirmation. |

Every transition needs an allow-listed source state, authorized actor, required fields, event/audit record, and idempotency strategy. Define cancellation and correction transitions before production. The database status checks constrain values but do not enforce the state machine; trusted service code must do that.

## Holding Fee and Deposit Controls

The repository does not establish a legally approved holding-fee policy. Before enabling a charge, define all of the following per market/property and have counsel approve the wording:

- Whether the amount is a holding fee, deposit, or another charge; who holds it and how it is accounted for.
- Amount/currency, when due, what action it secures, reservation start/end, and the exact timezone for expiry.
- Whether funds are refundable, when they are retained, who may cancel, and how withdrawal, denial, property unavailability, failed screening, late payment, duplicate payment, or provider outage affects the funds.
- Whether and when funds are credited to rent or security deposit; how the remaining move-in balance is calculated.
- Required receipts, disclosures, refund method/timing, records, and escalation/dispute handling.
- Whether any local rule changes the process, amount, deadline, payment type, handling, or required notice.

Recommended transaction sequence:

1. Recheck that the listing is eligible and that no unexpired active hold exists. Create the offer and hold in one database transaction, protected by the unique active-hold index.
2. Persist the exact accepted terms version and acceptance timestamp before creating the provider checkout session. Compute price server-side; never trust an amount supplied by the browser.
3. Create a pending ledger entry with a unique idempotency key. Create a provider session using the same stable operation identifier.
4. Verify webhook signature and event identity. Process provider events idempotently; update the ledger and hold only from verified server-side events. Reconcile out-of-order, duplicate, delayed, and missing events.
5. On verified success, mark payment succeeded and hold active, issue a receipt, and send the next required step. On expiry/cancellation, release the property and apply the approved refund/retention policy. A failed refund must enter an operations queue and remain visible until resolved.
6. Keep application fee, holding fee, security deposit, rent, other charges, refunds, and adjustments as distinct ledger entry types. Never overwrite the original transaction; create a linked refund/reversal/adjustment entry.
7. Before lease activation, reconcile the executed lease balance, deposits, credits, and payments. Provide staff tooling for unmatched transactions, chargebacks, refund failures, and manual corrections with reason and audit event.

The partial unique index protects concurrent active holds but does not expire holds by itself. A scheduled worker must expire stale `payment_pending`/`active` rows and handle a payment that arrives after the hold expiry according to approved policy.

## Notification Catalog

The 38 catalog entries below now have versioned, renderable subject, plain-text, and HTML templates in `src/services/emailTemplates.ts`. Rendering escapes HTML content, validates portal links, rejects missing placeholders, and requires an approval flag for adverse-action, emergency, deposit-disposition, and service-incident content. These are transactional content drafts, not legal approval. The app has no email provider, worker, or delivery integration yet; templates are not sent. Configure approved sender/reply-to, responsive styling, locale/timezone handling, provider delivery, test-send, and delivery audit before production. Avoid sensitive screening, identity, payment-instrument, and access details in messages. Suppress marketing only according to recorded consent and applicable law; required notices need their own approved content.

| Key | Event | Suggested email subject |
|---|---|---|
| `account.verify` | Account created; verification requested | Verify your email |
| `account.password_reset` | Password reset requested | Reset your password |
| `account.security_alert` | Approved security event | A sign-in to your account |
| `tour.received` | Tour request submitted | We received your tour request |
| `tour.confirmed` | Provider confirms slot | Your tour is confirmed |
| `tour.reminder` | Configured reminder before tour | Reminder: your home tour is coming up |
| `tour.changed` | Tour rescheduled or cancelled | Your tour has been updated |
| `application.started` | Application draft created | Your application is ready to continue |
| `application.submitted` | Submission accepted | We received your application |
| `application.fee_receipt` | Application-fee payment verified | Receipt for your application fee |
| `application.action_required` | Applicant must complete a screening step | Action needed to continue your application |
| `application.information_requested` | Additional information requested | Additional information is needed |
| `application.status_updated` | Applicant-visible status transition | An update on your rental application |
| `application.conditional_approval` | Conditional approval issued | Next steps for your application |
| `application.adverse_action` | Denial/adverse action notice is due | An update on your application |
| `offer.issued` | Versioned home offer issued | Your home offer and next steps |
| `hold.expiry_reminder` | Configured reminder before hold expires | Reminder: your home offer expires soon |
| `hold.payment_receipt` | Holding payment verified | Receipt for your holding payment |
| `hold.expired` | Offer/hold expires | Your home offer has expired |
| `hold.refund_updated` | Refund initiated/completed/failed | Update on your refund |
| `lease.ready_to_sign` | Lease package published | Your lease is ready to review and sign |
| `lease.signature_reminder` | Required signer has not signed | Your lease signature is still needed |
| `lease.executed` | All required signatures complete | Your lease is complete |
| `move_in.balance_due` | Move-in balance calculated | Your move-in balance and payment options |
| `move_in.payment_receipt` | Move-in funds verified | Receipt for your move-in payment |
| `move_in.preparation` | Configured move-in checklist reminder | Getting ready for move-in |
| `resident.account_ready` | Resident account provisioned | Set up your resident account |
| `maintenance.received` | Service request created | We received your maintenance request |
| `maintenance.updated` | Work order/appointment changed | Update on your maintenance request |
| `maintenance.emergency` | Emergency path triggered | Important: maintenance assistance |
| `rent.reminder` | Rent reminder schedule | Rent payment reminder |
| `payment.failed` | Provider reports failed payment | There is an issue with your payment |
| `payment.receipt` | Rent/payment settled | Rent payment receipt |
| `renewal.offer` | Renewal offer issued | Your lease renewal offer |
| `renewal.reminder` | Renewal offer deadline approaching | Reminder: respond to your renewal offer |
| `move_out.instructions` | Notice accepted | Move-out steps and important dates |
| `deposit.disposition` | Deposit itemization/refund issued | Your security deposit disposition |
| `service.incident` | Approved operational incident message | Important update about your account or home |

Use SMS only for approved short reminders/status alerts with consent and opt-out handling. SMS should link to the authenticated portal rather than contain application details, amounts requiring explanation, documents, or credentials. In-app notifications should mirror relevant transactional events and link to the corresponding account record.

## Data and Security Boundary

Migrations `20261020000004_add_leasing_workflow_foundation.sql` and `20261020000005_add_screening_deposits_lease_workflows.sql` create local-only private records for applications, staff memberships, participants/consents/events, versioned policies, screening cases and notices, offers/holds, payment ledger/allocations, security deposits/dispositions, leases/signers/documents/events, renewal offers, resident service requests, and notification preferences/outbox/delivery attempts. These migrations have not been applied to the linked hosted database. RLS is enabled and browser roles receive no grants. Staff memberships are private and must be provisioned through a trusted administrative process. Consent, application, screening, lease, policy, payment-allocation, notice, and notification-attempt history is append-only at the table-grant level where appropriate; mutable workflow rows remain service-role controlled. Never put the service-role key in a browser variable or client bundle.

`src/services/leasingWorkflow.ts` contains pure domain guards for application/screening transitions, offer eligibility, confirmed hold payment, lease execution, security-deposit receipt, and deposit disposition. Unit tests cover those guards. They are not yet called by an API, so they do not make a transaction operational.

The tables are scaffolding, not complete authorization. Build server-side operations that verify the signed-in user, household/property/lease relationship, staff role, status transition, and provider webhook signature before reading/writing. Do not expose the service role to the browser. Keep provider secrets in server-only secret storage. Validate and minimize notification payloads; they should carry identifiers and non-sensitive rendering values, not identity documents, screening details, or full payment data. Define retention/deletion, audit access, incident response, encryption/storage, backups, and least privilege before collecting real applicant/resident data.

## Implementation Order

1. Obtain authorized product scope, provider decisions, operating policies, local fee/deposit rules, legal notice content, support ownership, and staging credentials.
2. Review the migration with Supabase CLI/database lint in a disposable staging project. Test RLS using `anon`, `authenticated`, and `service_role`; verify browser roles cannot read/write private tables. Add policies only when authenticated portal access is intentionally implemented.
3. Implement server-side application APIs and explicit state transition functions; add staff queues, permissions, audit logging, secure provider references, and applicant-visible progress.
4. Implement manual staff verification workflows for payments (Zelle, Venmo, Cash App, Card receipts) and screening reviews with immutable audit logging. Automated third-party payment and screening APIs are permanently excluded.
5. Add notifications from committed domain events using the transactional outbox. A worker claims due rows safely, records each attempt, retries transient failures with backoff, and surfaces permanent failures. Test duplicate events, provider outage, bounce, suppression, and out-of-order webhooks.
6. Implement offers/holds and the policy-approved refund/expiry worker; test concurrent holds and late/duplicate payments before a real charge is enabled.
7. Implement lease document generation/signature callbacks, resident activation, move-in, maintenance, renewal, move-out, and deposit accounting in staged releases.
8. Run accessibility/security review, staging end-to-end tests, backup/restore and incident drills, operational training, and market-specific legal sign-off. Enable live provider credentials only after release gates pass.

## Acceptance Gates

- No applicant/resident PII is reachable to anonymous users or another household; staff access is role-scoped and audited.
- Every payment is recorded with a verified manual reference code (Zelle, Venmo, Cash App, Card) and an immutable internal audit ledger entry.
- A property cannot have two unexpired active holds; expiry and late-payment paths release or resolve the hold under approved policy.
- Every status-changing event is attributable, timestamped, idempotent, and visible to the correct tenant/staff roles.
- Required notifications are rendered from the correct template version, retried safely, and monitored for permanent delivery failure.
- Lease execution requires all configured signers, and move-in/renewal/move-out/deposit accounting matches the signed terms and approved local rules.
- Public listing data remains clearly separate from authoritative operational application, payment, lease, and resident states.