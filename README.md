# Invitation Homes Frontend Replica

An authorized Vite + React renter experience with a 60-listing public inventory pilot. Email-verified application intake and Google Apps Script notification plumbing are implemented but require server secrets and database migrations to be deployed. This is not yet a production leasing/resident platform: screening, account access, payments, tours, lease execution, and resident operations are not connected. See [Implementation Status](docs/IMPLEMENTATION_STATUS.md) for done/blocked work and [Project Guide](docs/PROJECT_GUIDE.md) for architecture and setup.

## Current Experience

- Responsive homepage with the official navigation structure, brand assets, market directory, service information, renter guidance, and testimonials.
- Search routes at `/search/houses-for-rent` and `/markets/houses-for-rent/:market` with location, price, bedroom, bathroom, square-footage, pet, and Smart Home filters. Queries use Supabase when configured and local fixtures otherwise.
- Official-source inventory sync with a 60-listing pilot across all 20 public market routes (three representative listings per market).
- URL-synchronized search filters, sort order, map/list mode, and pagination state.
- Property detail routes at `/houses-for-rent/:slug` with a photo gallery, rent summary, listing sections, and optional property-specific 360-degree tour or floor-plan media.
- Qualification, before-you-apply, application-process, and leasing-fees pages.
- A tenant workflow at `/tenant-workflow` covering application, screening state, holding terms, lease review, security deposit, move-in, maintenance, renewal, move-out, deposit disposition, and an in-app activity timeline. The browser-local workflow is not server-backed: it does not submit operational applications, run screening, reserve homes, move funds, execute legal documents, create work orders, or send notices.
- Email-verified application intake at `/apply/:propertySlug`: submission is stored as a draft, terms consent is versioned, and a one-time email link is required before the application is marked submitted. It requires migration 7 plus server-side configuration.
- 40 versioned transactional email templates in TypeScript and Google Apps Script. Sensitive legal/incident templates require approved content. Apps Script delivery uses a transactional outbox with retry status; the script and server environment still need deployment/configuration.
- Keyless Leaflet map with OpenStreetMap tiles in the search view. No API key, billing account, or paid map tier is required.
- A Playwright capture script for comparing the official and local homepages at desktop and mobile viewports.

These routes are a work in progress and have not been certified for pixel-perfect parity. The imported listings are a small live-data pilot; the local fixture set and some informational copy are previews and must not be treated as authoritative operational or legal guidance.

## Choice integration

The implementation scope, architecture mapping, policy boundaries, phase
checklist, and AI handoff procedure for Choice-style workflows are documented
in [Choice Integration and Agent Handoff](docs/CHOICE_INTEGRATION_HANDOFF.md).
No property or applicant records from the Choice repository should be imported.

## Technology

- React 19, TypeScript, Vite, and Tailwind CSS v4.
- Express server with Vite middleware in development and static-file serving in production.
- Supabase JS client and a Postgres migration for published property inventory, a paginated search RPC, and RLS-protected saved-property/search tables.
- Leaflet map with OpenStreetMap tiles and price-pin markers. No map API key is needed.
- Playwright for browser-based visual capture and interaction checks.
- Cheerio and JSZip remain in the repository for the separate cloner/transpiler tooling; those tools are not mounted in the active official-site application shell.

## Local Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The server uses the `PORT` environment variable when set.

## Supabase Inventory Setup

The initial inventory schema, RLS policies, saved-data tables, paginated search RPCs, official-source fields, and market-slug search RPC have been applied to the linked Supabase project. Public inventory search/detail reads are connected; applicant PII, resident authentication flows, payments, tour booking, and maintenance workflows are not implemented.

Application intake is separate from the public inventory client. Apply migration `20261021000006_add_public_application_intake.sql` to staging first. The intake endpoint requires server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APPLICATION_BASE_URL`, `APPLICATION_RATE_LIMIT_SECRET`, `APPLICATION_DISPATCH_SECRET`, `APPS_SCRIPT_WEB_APP_URL`, `APPS_SCRIPT_SHARED_SECRET`, `APPLICATION_SUPPORT_EMAIL`, and `APPLICATION_REVIEW_EMAIL`. Configure these in the Node server environment or Cloudflare Pages Functions secrets. Never use `VITE_` for these values.

Deploy the Google Apps Script in [apps-script/Code.gs](apps-script/Code.gs) as a web app, set its `APP_EMAIL_SHARED_SECRET` Script Property to the same long random value used by `APPS_SCRIPT_SHARED_SECRET`, and configure a verified `SENDER_EMAIL_ALIAS` if using one. See [Google Apps Script email setup](docs/GOOGLE_APPS_SCRIPT_EMAIL.md) for Gmail quotas and sender-domain SPF/DKIM/DMARC setup. Inbox placement cannot be guaranteed.

To link another project and apply migrations, use the Supabase CLI from your own terminal:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
```

The login command needs a Supabase personal access token; linking or pushing may require the database password. Enter those only in terminal/dashboard prompts. Never paste them into chat, commit them, or put them in Vite variables. See the [migration list](docs/PROJECT_GUIDE.md#database-migrations) for the three applied migrations.

Set the project URL and public anon/publishable key in local `.env` or the hosting environment:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

This workspace does not keep local Supabase variables in a committed file. Configure `VITE_SUPABASE_URL` and the browser-safe anon/publishable key in an ignored local environment file or hosting settings to use the hosted pilot. Without them the app uses clearly labeled local sample fixtures. Never put a Supabase service-role key in a `VITE_` variable or browser bundle. RLS exposes published eligible homes and scopes saved rows to the authenticated owner. Saved tables exist, but saved-home/search UI persistence is not implemented.

### Authorized Inventory Sync

The sync reads the authorized official public property search/detail endpoints, checks market counts and source IDs, and excludes self-show URLs, access codes, and contact records. The linked project currently has 60 representative listings (three per each of 20 markets); 58 have photos, and all 60 have fees, lease terms, and school records. The command defaults to three representative listings per market and dry-run mode:

```bash
npm run sync:official-inventory -- --limit-per-market=3
npm run sync:official-inventory -- --limit-per-market=3 --apply
```

Use `--market=atlanta-georgia` to limit a run to one market. `--all --apply` is an explicit full-catalog import; review a complete dry run first. Source availability changes continuously, so the sync reports count differences and refuses material gaps. Imported image files are not copied into Supabase; only public image URLs are stored.

### Map Tiles

The map is built with Leaflet and OpenStreetMap tiles. It needs no API key, no billing account, and no paid tier. The default tile URL and attribution are baked in, so the map works with an empty environment file.

To use a different free tile provider, set the tile URL and attribution explicitly:

```bash
VITE_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_TILE_ATTRIBUTION="&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
```

`VITE_` values are included in browser code, so they are public in the generated bundle. Never use them for a secret.

OpenStreetMap's public tile servers have a fair-use policy. They are fine for a small pilot, but a high-traffic site should use a self-hosted or dedicated free tile source instead of the shared public servers.

### ImageKit Remote-Origin Delivery

The app can generate ImageKit transformation URLs for the official image origin without uploading duplicate image files. Configure `VITE_IMAGEKIT_URL_ENDPOINT` (for example, `https://ik.imagekit.io/YOUR_IMAGEKIT_ID`) and set up that origin as an ImageKit remote source. Optionally set `VITE_IMAGEKIT_SOURCE_ORIGIN`; it defaults to `https://images.invitationhomes.com`. The endpoint is not configured in this workspace, so images currently load directly from the official CDN. Remote-origin transformation avoids storing image binaries in Supabase, but does not reduce storage used by the original image host. If ImageKit storage/uploads are desired instead, implement that separately with a server-side private key; never expose it in a `VITE_` variable.

## Validation and Capture

```bash
npm run lint
npm run build
npm test
npm run visual:capture
```

The capture script writes screenshots and a JSON report to `.artifacts/visual-parity/`, which is git-ignored. It captures the official and local homepages at 1440x900 and 390x844, and checks rendering, browser errors, image failures, and horizontal overflow. Install Playwright's browser first with `npx playwright install chromium`. On Linux systems missing browser libraries, `npx playwright install-deps chromium` requires system package installation privileges.

`npm run test:supabase` runs search/RLS integration checks against the linked Supabase project. It requires an authenticated Supabase CLI and uses unique temporary listing rows inside a transaction that is rolled back. Prefer a staging project for this check.

For repository orientation, data flow, migration history, sync semantics, security boundaries, and remaining production work, read the [Project Guide](docs/PROJECT_GUIDE.md).

## Deploy a Preview to Cloudflare Pages

Cloudflare Pages can host the built frontend as a static site. This does not deploy the Express server or create a production leasing backend.

1. In the Cloudflare dashboard, open **Workers & Pages**, create a Pages application, and connect this GitHub repository.
2. Select `main` as the production branch and use these build settings:

	| Setting | Value |
	| --- | --- |
	| Framework preset | Vite |
	| Build command | `npm run build` |
	| Build output directory | `dist` |
	| Root directory | Repository root (leave the default) |

3. Set the build environment to Node.js 22 or newer (Vite 8 requires Node.js 20.19+ or 22.12+).
4. In the Pages project settings, no map variables are required. The Leaflet map uses keyless OpenStreetMap tiles by default. If you use a different tile provider, add `VITE_MAP_TILE_URL` and `VITE_MAP_TILE_ATTRIBUTION` for both Preview and Production environments. A `VITE_` value is public in the generated browser bundle; never use it for a secret.
5. Save the settings and trigger a deployment. Cloudflare builds the selected branch and publishes `dist`; use the generated `*.pages.dev` URL to review the preview. Add a custom domain only after the preview and authorization settings are verified.

The app uses client-side routes. Cloudflare Pages serves the SPA entry point for routes when no `404.html` is present; verify direct loads of `/search/houses-for-rent`, `/qualify`, and a property route on the deployed preview.

### Cloudflare Pages Runtime Boundary

Pages serves the static Vite output only. The local Express endpoints (`/api/clone` and `/api/transpile`) are not deployed by these settings. The active rental frontend does not depend on them, but any future feature that needs those endpoints must be moved to Pages Functions/Workers or a separately hosted API. Do not expose the URL-fetching clone endpoint publicly without SSRF protections, destination validation, request limits, and access controls.

The Express server registers these endpoints only outside production when `ENABLE_CLONER_API=true`. This is a development-only opt-in, not an SSRF defense; do not enable it for untrusted traffic.

## Production Status and Security Notes

The current frontend is not ready to serve as the live leasing backup. The public listing source is connected for a 60-home pilot; before operational use, expand and monitor the sync, configure the public Supabase client, complete ImageKit setup if desired, implement or link authorized renter/resident services, and finish desktop/mobile visual and accessibility review. No paid map service is needed for the map.

The Express server also contains development cloner endpoints, including `/api/clone`, which fetches a caller-provided URL. Do not expose this endpoint publicly until it has strict destination validation, SSRF protections, request limits, and appropriate access controls; remove or disable it from the production service if the cloner is not needed.

## Backend Status

The Supabase schema, RLS policies, versioned search RPCs, browser client, inventory repository, and official-source sync are implemented. The Staff Operations Console (`/staff/portal`) and Tenant Resident Portal (`/tenant/portal`) provide full operational management for listing staging, application reviews, lease agreements, and move-in inspections. Payment records (Zelle, Venmo, Cash App, Card receipts) and tenant screening reviews operate permanently on manual staff verification with immutable audit logging; automated payment and screening APIs are permanently excluded.

## Authorization and License

This project is maintained as an authorized Invitation Homes backup frontend. Use of the Invitation Homes name, marks, copy, and assets must remain within the authorization granted for this project. The repository license is MIT; that license does not grant rights to third-party marks or content beyond the applicable authorization.
