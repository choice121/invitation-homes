# Project Guide

Status date: 2026-10-21

For a concise status matrix and current blockers, see [Implementation Status](IMPLEMENTATION_STATUS.md).

This guide describes the code and hosted Supabase state as currently implemented. It is intended as the first stop for contributors who need to understand the backup, run it locally, refresh the authorized inventory pilot, or plan the remaining production work.

For the application-to-lease-to-resident lifecycle, holding-fee controls, notification catalog, and operational workflows, see [Tenant Leasing Workflow](TENANT_LEASING_WORKFLOW.md). Operational workflows for payment records and screening reviews permanently operate via manual staff verification and logging; automated payment and screening APIs are permanently excluded.

## 1. Purpose and Boundaries

This repository is an authorized frontend backup for the public Invitation Homes renter experience. It is a Vite + React application, not a clone of the original company's private leasing, resident, payment, screening, or property-management systems.

The active app provides a branded homepage, listing search, market pages, property detail pages, and renter guides. Public property search/detail reads are connected to Supabase. The linked database currently contains a representative pilot of 60 source-managed homes across 20 market routes, not the full live catalog. The inventory sync can be re-run and expanded, but a full-catalog run has not been performed.

The original public site exposes selected listing information. It does not expose the internal systems required to make a complete leasing or resident platform. Do not invent access codes, applicant decisions, payment status, resident account data, or maintenance state.

## 2. How the App Is Organized

- `src/main.tsx` mounts the React application.
- `src/App.tsx` dispatches `/` to the homepage and other paths to the rental-page dispatcher.
- `src/components/OfficialHomepage.tsx` contains the public homepage.
- `src/components/OfficialRentalPages.tsx` contains market/search, property detail, and generic public-information routes.
- `src/components/RenterGuides.tsx` contains qualification, before-you-apply, application-process, and leasing-fee guides.
- `src/components/TenantWorkflowPortal.tsx` provides the `/tenant-workflow` browser-local journey; its state machine is in `src/services/tenantWorkflow.ts`.
- `src/services/emailTemplates.ts` contains 38 versioned transactional email templates with plain-text/HTML rendering and approval gates for sensitive notices. It does not send mail.
- `src/components/OfficialSiteChrome.tsx` owns shared navigation and footer markup.
- `src/services/propertyRepository.ts` maps database rows to the frontend property model and provides the local-fixture fallback.
- `src/lib/supabaseClient.ts` initializes Supabase only when both public client variables are configured.
- `src/lib/propertyImages.ts` builds de-duplicated image lists and optionally routes approved source URLs through ImageKit transformations.
- `src/data/properties.ts` contains local preview fixtures. These are not authoritative inventory.
- `server.ts` runs Express with Vite middleware in development and serves the static build in production. The legacy cloner APIs are disabled in production and require an explicit development opt-in.
- `scripts/sync-official-inventory.mjs` reads the authorized public listing/search and detail endpoints and upserts a bounded inventory sample.
- `scripts/test-supabase.mjs` runs rollback-only live database integration checks.

The active UI does not mount `ClonerStudio`, `QuickTranspiler`, `InvitationHomesApp`, or other legacy prototype panels. Keep these distinct from the renter application. The `AccuracyAudit` panel was removed because its hard-coded parity scores were unsupported by route coverage or completed screenshot review.

## 3. Runtime Configuration

| Variable | Purpose | Browser-visible? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Yes; protected by RLS |
| `VITE_MAP_TILE_URL` | Optional tile URL override for the Leaflet map | No; defaults to keyless OpenStreetMap tiles |
| `VITE_MAP_TILE_ATTRIBUTION` | Optional tile attribution override | No; defaults to OpenStreetMap attribution |
| `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit public delivery endpoint | Yes |
| `VITE_IMAGEKIT_SOURCE_ORIGIN` | Approved source origin for ImageKit URL conversion | Yes |
| `ENABLE_CLONER_API` | Explicitly opts development server into legacy clone endpoints | Server only; never use in production |
| `PORT` | Express listen port | Server only |

No service-role key, ImageKit private key, payment secret, screening credential, or smart-lock credential belongs in a `VITE_` variable or browser bundle. The current workspace does not have durable local Supabase or ImageKit environment files. The local preview server that was started for the pilot received the public Supabase settings at process launch only.

Without Supabase configuration, search uses local fixtures and labels them as preview data. With Supabase configured, search reads hosted published properties. An empty database correctly produces no listings.

## 4. Data Flow and Property Contract

### Public source

The sync uses the official site's public endpoints:

- `GET /property/api/geo-search` for paginated search results.
- `GET /property/api/property-details?id={property_id}` for optional detailed fields.
- Official market pages for a current market count used as a completeness check.

The geo-search endpoint is spatial. The script queries bounded market extents, requests pages with a 24-record cap, filters every record by its exact official `market_slug`, and de-duplicates by the source `property_id`. Overlapping regional bounds can include nearby markets; the slug filter is essential. Source counts can change between page requests, so the importer allows only a small variance and stops on a material gap.

### Stored fields

The base `public.properties` table stores the listing's address, current advertised rent, room/area counts, available date, current status, pets, smart-home features, amenities, public photo URLs, map coordinates, and publication state. The inventory migration adds:

- Source identity: `source_id`, `source_market_slug`, and `source_status`.
- All-in monthly rent, public description, fee breakdown, lease-term choices, schools, disclosures, floor-plan image URLs, property type, pool flag, and `synced_at`.
- A partial unique index on `source_id` to make source upserts idempotent while preserving manually managed rows without a source ID.

The importer maps source statuses as follows:

| Official source status | App status |
| --- | --- |
| `Vacant Unrented Ready` | `available` |
| `Vacant Unrented Not Ready` | `coming_soon` |
| `Notice Unrented` | `pending` |
| Other statuses | Not imported by this pilot |

The importer stores no self-show URL or access code and does not copy contact records. It stores only a same-origin `/lease` application URL when the official detail endpoint marks the application enabled. It does not scrape authenticated resident/applicant systems.

### Synchronization behavior and limits

The importer upserts selected rows by `source_id` and updates `synced_at`. It does not currently unpublish or delete source-managed rows that disappear from a later feed, and it does not guarantee atomicity across all batches. Before treating it as a recurring production sync, add snapshot/run tracking, stale-listing reconciliation, retry/resume semantics, and an operational alert for partial runs.

The default is deliberately small: three representative listings per market, dry-run only. Use `--market=SLUG` to narrow a run. `--limit-per-market=N` changes the pilot size. `--all` selects every verified listing from each configured market. `--apply` performs database writes. Always inspect a dry run before applying; use a staging Supabase project for sync development.

```bash
# Three representative listings per market; no database changes
npm run sync:official-inventory -- --limit-per-market=3

# One market; still dry-run unless --apply is present
npm run sync:official-inventory -- --market=austin-texas --limit-per-market=5

# Apply the small pilot
npm run sync:official-inventory -- --limit-per-market=3 --apply

# Full-catalog dry run, only after reviewing the output
npm run sync:official-inventory -- --all

# Full-catalog upsert; this can make many source requests and write many records
npm run sync:official-inventory -- --all --apply
```

Do not run the full-catalog apply against production until stale inventory behavior, sync monitoring, and the data authorization scope have been reviewed.

## 5. Image Delivery and ImageKit

Supabase stores image URL strings; it does not store the image binaries. The source photos are served from `images.invitationhomes.com`. The current 60-record pilot has 58 homes with photos.

`src/lib/propertyImages.ts` can construct ImageKit transformation URLs for that approved origin. To enable it:

1. Configure the official image origin as a remote origin in the ImageKit account.
2. Set `VITE_IMAGEKIT_URL_ENDPOINT` in local or deployment environment settings.
3. Optionally set `VITE_IMAGEKIT_SOURCE_ORIGIN` if the authorized origin changes.
4. Verify transformed images on representative listing cards, galleries, floor plans, and mobile widths.

No ImageKit endpoint is configured in the current workspace, so the app currently falls back to the official CDN URLs. The current integration is remote-origin optimization; it does not upload originals into ImageKit and does not reduce storage usage at the source host. If ImageKit should own uploaded copies instead, implement a server-side uploader with a private ImageKit key and a migration/rollback plan; do not put that key in client variables.

## 6. Database Migrations and Access Control

The first four local migrations are applied to the linked Supabase project. Migrations 5 and 6 are local-only and have not been applied:

1. `supabase/migrations/20261020000000_initial_rental_backend.sql`: properties, saved properties/searches, RLS, grants, and original paginated public search RPC.
2. `supabase/migrations/20261020000001_add_property_uuid_to_search.sql`: backward-compatible search RPC returning the database UUID separately from the URL slug.
3. `supabase/migrations/20261020000002_add_official_inventory_fields.sql`: source identity and detail fields, nullable unknown deposit, and expanded listing RPC data.
4. `supabase/migrations/20261020000003_add_market_slug_search.sql`: market-slug-aware RPC used by official market routes.
5. `supabase/migrations/20261020000004_add_leasing_workflow_foundation.sql`: private application, staff-membership, offer/hold, lease, ledger, resident service-request, and notification-outbox records. Browser roles receive no grants; operations are secured through authenticated staff/tenant workflows with manual verification.
6. `supabase/migrations/20261020000005_add_screening_deposits_lease_workflows.sql`: versioned market policies, screening cases and notice records, payment allocations, security-deposit disposition, provider lease documents, and lease events.

The public properties table has RLS enabled. Anonymous/authenticated users can read published eligible listings only; client roles have no inventory write grants. Saved rows are scoped to `auth.uid()`. The public listing RPCs are `SECURITY INVOKER`, use a constrained search path, and are granted to `anon` and `authenticated`, not `PUBLIC`.

To check migration state and schema:

```bash
npx supabase@latest migration list --linked
npx supabase@latest db lint --linked --schema public --fail-on warning
```

`npm run test:supabase` requires an authenticated, linked Supabase CLI. It inserts unique temporary fixtures in one transaction, tests published visibility, filters, UUID mapping, and market slugs, and rolls the transaction back. Prefer a staging project even though the test is rollback-only.

## 7. Application Routes and Functional Gaps

Current app-owned routes include `/`, `/search/houses-for-rent`, `/markets/houses-for-rent/:market`, `/houses-for-rent/:slug`, `/qualify`, `/before-you-apply`, `/how-to-apply`, `/fees`, and the browser-local `/tenant-workflow` journey. Several other public content routes are currently lightweight generic pages. Not every navigation destination is a fully implemented workflow.

The property detail page uses source description, rent total, fees, disclosures, schools, floor plans, and the official application URL when available. The official application handoff remains external. The `/tenant-workflow` route covers application, screening status, holding terms, lease review, security deposit, move-in, maintenance request, renewal choice, move-out checklist, deposit disposition, and local activity. Workflow state is stored in the browser tab and does not use the private leasing schema or perform real screening, reservations, payments/refunds, legal signing, work orders, or notices. Tour controls show only a provided public virtual tour; self-show scheduling and lock access are intentionally not implemented. Saved buttons are local UI state; there is no sign-in or persisted saved-home/search UI yet.

## 8. Security and Deployment Boundaries

- Cloudflare Pages deploys the static Vite output only. It does not host this Express server or its APIs.
- Express registers `/api/clone` and `/api/transpile` only outside production when `ENABLE_CLONER_API=true`. This is not SSRF protection; never enable these endpoints for untrusted traffic.
- The clone endpoint can fetch caller-supplied URLs. If it is ever made public, it needs destination/IP validation, redirect validation, request limits, rate limiting, access control, timeouts, and SSRF testing; otherwise remove it.
- `QuickTranspiler` previews HTML in a sandboxed iframe. Keep that feature out of the active public rental UI unless its threat model is reviewed.
- `VITE_` values are public. Store private service credentials server-side only.
- Preserve the authorization scope for source data, branding, copy, and imagery. The repository's MIT license does not grant rights to third-party content.

## 9. Validation and Release Gates

```bash
npm run lint
npm test
npm run build
npm run test:supabase
npm run visual:capture
```

Current verified checks include TypeScript lint, 34 unit tests across property repositories, leasing workflow guards, internal status transitions, magic login helpers, and email templates, production build, hosted search/RLS integration tests, hosted public-schema lint, and direct HTTP route smoke checks. The Playwright browser capture now runs in this container after installing Chromium's Linux dependencies: `npm run visual:capture` completes with no page errors, console errors, or failed requests for the local homepage at desktop and mobile widths. The current capture script compares the homepage only; extend it to market/search/detail/tenant-workflow routes before asserting site-wide parity.

The production build currently emits a Vite warning about `__dirname` in `vite.config.ts`; it still builds successfully. Add CI to run lint, unit tests, build, database tests against staging, route tests, and visual checks.

## 10. Remaining Work, Prioritized

### Before any public production use

- Configure persistent browser-safe Supabase URL/anon key values; the Leaflet map needs no key. Validate the deployed market routes against the hosted pilot.
- Configure ImageKit's remote origin and URL endpoint if ImageKit delivery is required. Decide whether the goal is CDN transformation or ImageKit-owned image storage; they are not the same.
- Complete accessibility and visual comparison on homepage, search/market, detail, and renter-guide routes.
- Add operational inventory reconciliation so removed/unavailable listings cannot remain published indefinitely.
- Resolve page-specific content/routes, legal/privacy notices, cookie preferences, accessibility information, and all navigation destinations.
- Add production monitoring, structured logs, security headers, backup/restore, rollback, and incident ownership.

### Before real leasing or resident workflows

- Review [Tenant Leasing Workflow](TENANT_LEASING_WORKFLOW.md), obtain approved policies/provider choices, and lint/test the local-only workflow migration in staging before applying it anywhere.
- Implement authenticated account and persisted saved homes/searches.
- Integrate approved application, tour scheduling, identity/income screening, e-signature, payment, resident maintenance, and smart-lock providers separately.
- Define data minimization, retention, RLS, server-only secrets, audit logs, and compliance review before handling applicant or resident personal data.

### Future inventory expansion

- Review a full-catalog dry run and market-count discrepancies before using `--all --apply`.
- Add import run IDs, status reconciliation, retry/resume, duplicate/source validation, and failure notifications.
- Decide whether ImageKit should remain a remote-origin transformation layer or become the canonical uploaded image store.

## 11. Repository Collaboration and Push Access

GitHub CLI authentication identifies an account but does not grant repository write permission. Pushing to an upstream repository requires write access granted by its owner or organization. If only read access is available, push a branch to a fork and open a pull request; do not attempt to bypass repository permissions or reuse another account's token.

Check configured remotes and permissions before pushing:

```bash
git remote -v
gh auth status
gh repo view OWNER/REPO --json nameWithOwner,defaultBranchRef,viewerPermission
```

Keep commits scoped to intended files. Do not include unrelated user worktree changes such as a pre-existing lockfile change without reviewing why it exists.
