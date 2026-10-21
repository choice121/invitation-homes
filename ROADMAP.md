# Production Roadmap

Status date: 2026-10-21

For the current done/local-only/blocked/not-started matrix, see [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Status Summary

The authorized Vite/React backup has a working public listing/search integration and a **60-listing pilot across 20 markets** in the linked Supabase project. The sync is repeatable and defaults to a dry-run sample. This is a development pilot, not the full property catalog and not a production leasing/resident platform.

Search, market routes, property details, renter guides, public inventory RLS, and the market-aware search RPC are implemented. The official application handoff remains available. A browser-local `/tenant-workflow` now covers the full renter/resident sequence, but authentication, server-backed application/status, provider screening, payments, e-signature, notifications, tours, and resident services are not connected.

For repository structure, exact sync behavior, configuration, data fields, migrations, security boundaries, and commands, see [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md).
The tenant lifecycle, holding-fee controls, notification catalog, and proposed leasing implementation order are documented in [docs/TENANT_LEASING_WORKFLOW.md](docs/TENANT_LEASING_WORKFLOW.md).

## Implemented and Verified

- Responsive public homepage, shared site chrome, renter guides, search/map/list view, property detail, and generic public-information routes.
- Supabase inventory tables, RLS, published-only search, UUID-aware search response, extended source fields, and exact market-slug filtering.
- Authorized source importer at `scripts/sync-official-inventory.mjs`. Default mode is dry-run, selecting three listings per market; pilot upserts use source IDs and do not copy image binaries.
- 60 source-managed listings across 20 source markets. 58 have photo URLs; the imported pilot has fees, lease terms, and school data for all records.
- Supabase integration test `npm run test:supabase`; test fixtures are transaction-scoped and rolled back.
- Production builds, TypeScript checks, 34 unit tests, hosted RLS/search checks, and hosted schema lint pass.
- `/api/clone` and `/api/transpile` are not registered in production. In development they require `ENABLE_CLONER_API=true`; that flag is not protection against untrusted traffic.
- User-provided HTML preview in the dormant transpiler is sandboxed. Unsupported hard-coded parity-score panel was removed.

## Current External Configuration

- Supabase schema and pilot data are in the linked hosted project. The local workspace does not persist Supabase URL/anon-key configuration; configure the public key and URL in an ignored local environment file or deployment settings to see hosted listings.
- The search view map uses Leaflet with keyless OpenStreetMap tiles. No map API key, billing account, or paid tier is required. Tiles have not been validated against production traffic; the public OpenStreetMap servers have a fair-use policy and are not intended for high traffic.
- ImageKit transformation support exists, but no ImageKit URL endpoint is configured. Images still load from the authorized source CDN. The current integration optimizes a remote origin and does not upload images or reduce storage at the original host.
- The Playwright capture now runs in this container after installing Chromium's Linux dependencies. `npm run visual:capture` reports no page errors, console errors, or failed requests for the local homepage at desktop and mobile widths. The capture script still covers the homepage only; broader route visual checks remain.

## Next Work, in Order

### 1. Validate the Backup Experience

- Configure persistent Supabase public client variables for a staging/preview environment. The Leaflet map needs no map API key; only set `VITE_MAP_TILE_URL` and `VITE_MAP_TILE_ATTRIBUTION` if you move to a dedicated tile provider.
- Test market filters, all-in rent display, application handoff, photo/floor-plan galleries, empty states, and direct route loads against the 60-listing pilot.
- Configure ImageKit's approved remote origin and URL endpoint if desired, then compare delivery, transformations, failures, and mobile performance.
- Extend the capture script to the search, market, property-detail, and renter-guide routes at desktop and mobile widths, and install Chromium's Linux dependencies in CI so the capture runs there as well.
- Add accessibility/keyboard review and route/interactions tests before claiming parity.

### 2. Make Inventory Sync Operational

- Review a full-catalog dry run before using `--all --apply`; verify per-market counts, unique source IDs, status mapping, photos, fee records, and rate limits.
- Add import-run tracking, retry/resume, stale-listing reconciliation, rollback/restore guidance, and alerts. Current upserts do not unpublish records missing from a later source response.
- Decide whether the 60-listing sample stays as staging content or is replaced with complete approved inventory.
- Add source freshness indicators and a scheduled sync only after operations ownership and failure handling are defined.

### 3. Implement Renter and Resident Workflows

- Review the local-only leasing foundation migration and workflow document; they are scaffolding and have not been applied to the linked hosted project.
- The `/tenant-workflow` UI exercises application through move-out locally; build authenticated APIs and provider callbacks before treating its state as operational.
- Add authenticated saved homes and searches using existing RLS tables; map public slugs to database UUIDs.
- Keep applications, applicant PII, payments, screening, e-signature, tour booking, resident maintenance, and smart-lock functions in separate approved provider integrations.
- Before storing sensitive user data, define schemas, RLS/policies, consent, retention, audit logging, incident response, and applicable legal/fair-housing controls.
- Never store lock access credentials in public listing records or client-visible fields.

### 4. Finish Public Content and Release Operations

- Replace generic content fallbacks with approved page-specific copy/layouts, or deliberately link users to authorized official services.
- Verify every header/footer link, privacy/terms/cookie controls, Equal Housing/accessibility content, and external service destinations.
- Add production monitoring, structured logging, health checks, content/security headers, backups, rollback procedure, and CI release gates.
- Resolve the Vite `__dirname` configuration warning and add Chromium's Linux dependencies to CI so visual checks run on every build.

## Database Migrations

The first four migrations below are applied to the currently linked Supabase project. Migrations 5 and 6 are local-only and have not been applied:

1. `20261020000000_initial_rental_backend.sql` creates property inventory, saved-data tables, RLS, grants, and the original search RPC.
2. `20261020000001_add_property_uuid_to_search.sql` adds the UUID-aware v2 search RPC.
3. `20261020000002_add_official_inventory_fields.sql` adds source identity/details and expands the property data returned to the app.
4. `20261020000003_add_market_slug_search.sql` adds market-slug filtering used by market routes.
5. `20261020000004_add_leasing_workflow_foundation.sql` adds private leasing, holds, payment ledger, resident service request, and notification-outbox tables. It does not implement provider integrations or tenant/staff APIs.
6. `20261020000005_add_screening_deposits_lease_workflows.sql` adds approved policy versioning, screening cases/notices, holding-payment allocations, security-deposit disposition, lease documents, and lease events.

Run `npx supabase@latest migration list --linked` to compare local and remote migration history. Preview changes with `npx supabase@latest db push --linked --dry-run` before applying a migration.

## Release Checks

```bash
npm run lint
npm test
npm run build
npm run test:supabase
npm run visual:capture
```

See the Project Guide for command details, staging recommendations, and credential handling.