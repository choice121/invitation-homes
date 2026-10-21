import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SOURCE = 'https://www.invitationhomes.com';
const PAGE_SIZE = 24;
const DETAIL_CONCURRENCY = 6;
const WRITE_BATCH_SIZE = 48;
const APPLY = process.argv.includes('--apply');
const SYNC_ALL = process.argv.includes('--all');
const pilotLimitArg = process.argv.find((argument) => argument.startsWith('--limit-per-market='))?.split('=')[1];
const PILOT_LIMIT = SYNC_ALL ? Number.POSITIVE_INFINITY : Math.max(1, Number(pilotLimitArg) || 3);
const selectedMarket = process.argv.find((argument) => argument.startsWith('--market='))?.slice('--market='.length);

const MARKETS = [
  { name: 'Atlanta', slug: 'atlanta-georgia', bounds: [35.2, 32.8, -83.5, -85.5, 33.75, -84.39] },
  { name: 'Austin', slug: 'austin-texas', bounds: [31.2, 29.0, -96.5, -99.0, 30.27, -97.74] },
  { name: 'Carolinas', slug: 'charlotte-north-carolina', bounds: [38.0, 32.0, -77.0, -83.8, 35.23, -80.84] },
  { name: 'Chicago', slug: 'chicago-illinois', bounds: [42.7, 41.2, -86.6, -88.8, 41.88, -87.63] },
  { name: 'Dallas', slug: 'dallas-texas', bounds: [33.8, 32.0, -95.5, -98.2, 32.78, -96.8] },
  { name: 'Denver', slug: 'denver-colorado', bounds: [42.0, 36.0, -101.0, -109.0, 39.74, -104.99] },
  { name: 'Houston', slug: 'houston-texas', bounds: [30.7, 29.0, -94.0, -96.2, 29.76, -95.37] },
  { name: 'Jacksonville', slug: 'jacksonville-florida', bounds: [31.5, 29.2, -80.5, -82.8, 30.33, -81.66] },
  { name: 'Las Vegas', slug: 'las-vegas-nevada', bounds: [36.9, 35.2, -114.2, -116.2, 36.17, -115.14] },
  { name: 'Minneapolis', slug: 'minneapolis-minnesota', bounds: [46.0, 44.0, -91.7, -95.0, 44.98, -93.27] },
  { name: 'Northern California', slug: 'sacramento-california', bounds: [39.6, 37.0, -119.8, -123.2, 38.58, -121.49] },
  { name: 'Orlando', slug: 'orlando-florida', bounds: [29.8, 27.2, -80.0, -82.8, 28.54, -81.38] },
  { name: 'Phoenix', slug: 'phoenix-arizona', bounds: [34.8, 32.0, -110.8, -113.3, 33.45, -112.07] },
  { name: 'Salt Lake City', slug: 'salt-lake-city-utah', bounds: [42.0, 39.8, -110.5, -113.2, 40.76, -111.89] },
  { name: 'San Antonio', slug: 'san-antonio-texas', bounds: [30.5, 28.0, -97.2, -100.0, 29.42, -98.49] },
  { name: 'Seattle', slug: 'seattle-washington', bounds: [49.0, 46.0, -120.0, -124.5, 47.61, -122.33] },
  { name: 'South Florida/Miami', slug: 'miami-florida', bounds: [28.0, 24.0, -78.5, -82.5, 26.2, -80.5] },
  { name: 'Southern California', slug: 'los-angeles-california', bounds: [35.6, 32.3, -115.5, -119.5, 34.05, -118.25] },
  { name: 'Tampa', slug: 'tampa-florida', bounds: [30.0, 25.8, -79.5, -84.5, 27.95, -82.46] },
  { name: 'Nashville', slug: 'nashville-tennessee', bounds: [37.5, 35.7, -85.0, -88.0, 36.16, -86.78] }
];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchJson(url, attempts = 5) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        referer: `${SOURCE}/search/houses-for-rent`,
        'user-agent': 'InvitationHomes authorized inventory backup'
      },
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) return response.json();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === attempts - 1) {
      throw new Error(`Source request failed (${response.status}): ${new URL(url).pathname}`);
    }
    await sleep(500 * 2 ** attempt);
  }
  throw new Error(`Source request failed after retries: ${url}`);
}

function marketPagePath(market) {
  return `${SOURCE}/markets/houses-for-rent/${market.slug}`;
}

async function fetchOfficialCount(market) {
  const response = await fetch(marketPagePath(market), { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Market page failed (${response.status}): ${market.slug}`);
  const html = await response.text();
  const count = Number(html.match(/propertyCount:(\d+)/)?.[1]);
  if (!Number.isFinite(count)) throw new Error(`Missing official property count: ${market.slug}`);
  return count;
}

async function fetchMarketListings(market) {
  const [north, south, east, west, lat, long] = market.bounds;
  const listings = new Map();
  let sourceTotal = 0;

  for (let offset = 0; offset === 0 || offset < sourceTotal; offset += PAGE_SIZE) {
    const params = new URLSearchParams({
      north: String(north), south: String(south), east: String(east), west: String(west),
      lat: String(lat), long: String(long), limit: String(PAGE_SIZE), offset: String(offset)
    });
    const result = await fetchJson(`${SOURCE}/property/api/geo-search?${params}`);
    sourceTotal = Number(result.total ?? 0);
    const page = result.properties ?? [];
    if (page.length === 0 && offset < sourceTotal) {
      throw new Error(`Unexpected empty source page for ${market.slug} at ${offset}/${sourceTotal}`);
    }

    for (const listing of page) {
      if (listing.market_slug !== market.slug) continue;
      if (!listing.property_id || !listing.slug || !listing.address?.address_1 || !listing.map_location) {
        throw new Error(`Required public listing fields missing in ${market.slug} at offset ${offset}`);
      }
      listings.set(String(listing.property_id), listing);
    }
  }

  return { listings: [...listings.values()], sourceTotal };
}

function selectPilotListings(listings, limit) {
  if (listings.length <= limit) return listings;

  const statusOrder = ['Vacant Unrented Ready', 'Vacant Unrented Not Ready', 'Notice Unrented'];
  const selected = [];
  for (const status of statusOrder) {
    const listing = listings.find((candidate) => candidate.status === status);
    if (listing) selected.push(listing);
    if (selected.length === limit) return selected;
  }

  for (const listing of listings) {
    if (!selected.includes(listing)) selected.push(listing);
    if (selected.length === limit) break;
  }
  return selected;
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function safeApplicationUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, SOURCE);
    return url.origin === SOURCE && url.pathname.startsWith('/lease') ? url.href : null;
  } catch {
    return null;
  }
}

function safeHttpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if ([...url.searchParams.keys()].some((key) => /pin|code|access|token|key/i.test(key))) return null;
    return url.href;
  } catch {
    return null;
  }
}

function normalizeDisclosure(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return String(value.description ?? value.text ?? value.title ?? '').trim();
}

async function enrichListing(listing) {
  let detail = null;
  try {
    detail = await fetchJson(`${SOURCE}/property/api/property-details?id=${encodeURIComponent(listing.property_id)}`);
  } catch {
    // Keep the search result when the optional detail request is unavailable.
  }

  const detailsPhotos = (detail?.photos ?? []).filter((photo) => photo.type === 'photo' && !photo.hidden);
  const photos = detailsPhotos.length ? detailsPhotos : (listing.photos ?? []);
  const imageEntries = photos
    .map((photo) => ({ url: photo.image_url, sequence: Number(photo.sequence ?? 0), primary: Boolean(photo.primary ?? photo.is_primary) }))
    .filter((photo) => typeof photo.url === 'string' && photo.url.startsWith('https://images.invitationhomes.com/'))
    .sort((first, second) => Number(second.primary) - Number(first.primary) || first.sequence - second.sequence);
  const images = [...new Set(imageEntries.map((photo) => photo.url))];
  const floorPlanImages = [...new Set((detail?.floor_plans ?? [])
    .filter((plan) => typeof plan.image_url === 'string' && plan.image_url.startsWith('https://images.invitationhomes.com/'))
    .map((plan) => plan.image_url))];
  const amenities = (listing.amenities ?? []).map((amenity) => amenity.name).filter(Boolean);
  const amenitySlugs = new Set((listing.amenities ?? []).map((amenity) => amenity.slug));
  const sourceStatus = listing.status;
  const status = sourceStatus === 'Vacant Unrented Ready'
    ? 'available'
    : sourceStatus === 'Vacant Unrented Not Ready'
      ? 'coming_soon'
      : sourceStatus === 'Notice Unrented'
        ? 'pending'
        : null;

  if (!status) return null;

  const fees = (detail?.fees ?? listing.fees ?? []).map((fee) => ({
    name: String(fee.name ?? ''),
    title: String(fee.title ?? fee.name ?? ''),
    description: String(fee.description ?? ''),
    fee_amount: Number(fee.fee_amount ?? 0),
    is_required: Boolean(fee.is_required),
    frequency: String(fee.frequency ?? '')
  }));
  const leaseTerms = (detail?.terms ?? listing.terms ?? []).map((term) => ({
    term: Number(term.term),
    rent: Number(term.rent),
    total_monthly_rent: Number(term.total_monthly_rent),
    is_optimal_term: Boolean(term.is_optimal_term)
  }));
  const schools = (detail?.schools ?? []).map((school) => ({
    name: String(school.name ?? ''),
    distance: Number.isFinite(Number(school.distance)) ? Number(school.distance) : null,
    grade_level_description: school.grade_level_description ? String(school.grade_level_description) : null
  })).filter((school) => school.name);
  const disclosures = [...new Set((detail?.disclosures ?? []).map(normalizeDisclosure).filter(Boolean))];
  const applicationUrl = detail?.active_listing?.is_application_enabled
    ? safeApplicationUrl(detail.active_listing.application_url)
    : safeApplicationUrl(listing.application_url);

  return {
    source_id: String(listing.property_id),
    source_market_slug: listing.market_slug,
    source_status: sourceStatus,
    slug: listing.slug,
    title: `${listing.beds} bed, ${listing.baths} bath home in ${listing.address.city}`,
    address: listing.address.address_1,
    city: listing.address.city,
    state: listing.address.state,
    zip_code: listing.address.zip_code,
    market: listing.market_name,
    monthly_rent: Number(listing.rent),
    security_deposit: null,
    total_monthly_rent: Number(detail?.total_monthly_rent ?? listing.total_monthly_rent ?? listing.rent),
    bedrooms: Number(listing.beds),
    bathrooms: Number(listing.baths),
    square_feet: Number(listing.square_footage),
    available_date: listing.available_on || null,
    status,
    pet_friendly: amenitySlugs.has('pet-friendly'),
    pet_details: '',
    smart_home: amenitySlugs.has('smart-home'),
    smart_home_features: amenities.filter((name) => /smart|keyless|thermostat|doorbell/i.test(name)),
    amenities,
    images,
    featured_image: images[0] ?? '',
    virtual_tour_url: safeHttpsUrl(detail?.virtual_tour_url),
    floor_plan_image: floorPlanImages[0] ?? null,
    floor_plan_images: floorPlanImages,
    latitude: Number(listing.map_location.latitude),
    longitude: Number(listing.map_location.longitude),
    year_built: Number.isInteger(Number(detail?.year_built)) ? Number(detail.year_built) : null,
    parking_spaces: null,
    school_district: null,
    description: detail?.description ?? listing.description ?? null,
    fees,
    lease_terms: leaseTerms,
    schools,
    disclosures,
    application_url: applicationUrl,
    property_type: listing.property_type ?? null,
    has_pool: amenitySlugs.has('pool') || Boolean(detail?.has_pool),
    published: true
  };
}

function sqlText(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  return value == null || !Number.isFinite(Number(value)) ? 'NULL' : String(Number(value));
}

function sqlBoolean(value) {
  return value ? 'true' : 'false';
}

function sqlTextArray(values) {
  return `ARRAY[${values.map(sqlText).join(',')}]::text[]`;
}

function sqlJson(value) {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}

const columns = [
  'source_id', 'source_market_slug', 'source_status', 'slug', 'title', 'address', 'city', 'state', 'zip_code',
  'market', 'monthly_rent', 'security_deposit', 'total_monthly_rent', 'bedrooms', 'bathrooms', 'square_feet',
  'available_date', 'status', 'pet_friendly', 'pet_details', 'smart_home', 'smart_home_features', 'amenities',
  'images', 'featured_image', 'virtual_tour_url', 'floor_plan_image', 'floor_plan_images', 'latitude', 'longitude',
  'year_built', 'parking_spaces', 'school_district', 'description', 'fees', 'lease_terms', 'schools', 'disclosures',
  'application_url', 'property_type', 'has_pool', 'published', 'synced_at'
];

function sqlRow(row) {
  return `(${[
    sqlText(row.source_id), sqlText(row.source_market_slug), sqlText(row.source_status), sqlText(row.slug),
    sqlText(row.title), sqlText(row.address), sqlText(row.city), sqlText(row.state), sqlText(row.zip_code),
    sqlText(row.market), sqlNumber(row.monthly_rent), sqlNumber(row.security_deposit), sqlNumber(row.total_monthly_rent),
    sqlNumber(row.bedrooms), sqlNumber(row.bathrooms), sqlNumber(row.square_feet), sqlText(row.available_date),
    sqlText(row.status), sqlBoolean(row.pet_friendly), sqlText(row.pet_details), sqlBoolean(row.smart_home),
    sqlTextArray(row.smart_home_features), sqlTextArray(row.amenities), sqlTextArray(row.images),
    sqlText(row.featured_image), sqlText(row.virtual_tour_url), sqlText(row.floor_plan_image),
    sqlTextArray(row.floor_plan_images), sqlNumber(row.latitude), sqlNumber(row.longitude), sqlNumber(row.year_built),
    sqlNumber(row.parking_spaces), sqlText(row.school_district), sqlText(row.description), sqlJson(row.fees),
    sqlJson(row.lease_terms), sqlJson(row.schools), sqlTextArray(row.disclosures), sqlText(row.application_url),
    sqlText(row.property_type), sqlBoolean(row.has_pool), sqlBoolean(row.published), 'now()'
  ].join(',')})`;
}

async function writeBatch(rows, directory, batchNumber) {
  const updateColumns = columns.filter((column) => !['source_id', 'synced_at'].includes(column));
  const sql = `begin;\ninsert into public.properties (${columns.join(', ')}) values\n${rows.map(sqlRow).join(',\n')}\non conflict (source_id) where source_id is not null do update set\n${updateColumns.map((column) => `${column} = excluded.${column}`).join(',\n')},\nsynced_at = now(), updated_at = now();\ncommit;\n`;
  const filePath = path.join(directory, `batch-${batchNumber}.sql`);
  await writeFile(filePath, sql, 'utf8');
  execFileSync('npx', ['--yes', 'supabase@latest', 'db', 'query', '--linked', '--file', filePath], {
    stdio: 'inherit',
    timeout: 120000
  });
}

const markets = MARKETS.filter((market) => !selectedMarket || market.slug === selectedMarket);
if (selectedMarket && markets.length === 0) throw new Error(`Unknown market slug: ${selectedMarket}`);

console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}; markets: ${markets.length}; listings per market: ${SYNC_ALL ? 'all' : PILOT_LIMIT}; source detail concurrency: ${DETAIL_CONCURRENCY}`);

const allSourceIds = new Set();
const marketStats = [];
const sourceListings = [];

for (const market of markets) {
  const [officialCount, result] = await Promise.all([fetchOfficialCount(market), fetchMarketListings(market)]);
  const uniqueListings = result.listings.filter((listing) => !allSourceIds.has(String(listing.property_id)));
  uniqueListings.forEach((listing) => allSourceIds.add(String(listing.property_id)));
  if (uniqueListings.some((listing) => listing.market_slug !== market.slug)) {
    throw new Error(`Market slug mismatch while collecting ${market.slug}`);
  }
  if (Math.abs(uniqueListings.length - officialCount) > Math.max(5, Math.ceil(officialCount * 0.03))) {
    throw new Error(`Incomplete ${market.slug}: API returned ${uniqueListings.length}, official page reports ${officialCount}`);
  }
  const selectedListings = selectPilotListings(uniqueListings, PILOT_LIMIT);
  sourceListings.push(...selectedListings);
  marketStats.push({ market: market.name, slug: market.slug, expected: officialCount, collected: uniqueListings.length, selectedForSync: selectedListings.length, apiBoundsTotal: result.sourceTotal });
  console.log(`${market.slug}: verified ${uniqueListings.length}/${officialCount}; selected ${selectedListings.length} for sync`);
}

console.log(`Enriching ${sourceListings.length} listings with public detail fields...`);
let completedDetails = 0;
const enriched = await mapConcurrent(sourceListings, DETAIL_CONCURRENCY, async (listing) => {
  const row = await enrichListing(listing);
  completedDetails += 1;
  if (completedDetails % 250 === 0) console.log(`Detail requests: ${completedDetails}/${sourceListings.length}`);
  return row;
});
const rows = enriched.filter(Boolean);
if (rows.length !== sourceListings.length) {
  throw new Error(`Some source listings had unsupported statuses: ${sourceListings.length - rows.length}`);
}

const totalRows = rows.length;
const summary = {
  totalRows,
  uniqueSourceIds: new Set(rows.map((row) => row.source_id)).size,
  rowsWithPhotos: rows.filter((row) => row.images.length > 0).length,
  rowsWithDescription: rows.filter((row) => Boolean(row.description)).length,
  rowsWithFees: rows.filter((row) => row.fees.length > 0).length,
  rowsWithLeaseTerms: rows.filter((row) => row.lease_terms.length > 0).length,
  rowsWithSchools: rows.filter((row) => row.schools.length > 0).length,
  rowsWithFloorPlans: rows.filter((row) => row.floor_plan_images.length > 0).length,
  rowsWithApplicationLink: rows.filter((row) => Boolean(row.application_url)).length,
  rowsWithVirtualTour: rows.filter((row) => Boolean(row.virtual_tour_url)).length,
  marketStats
};

if (summary.uniqueSourceIds !== totalRows) throw new Error('Duplicate official source IDs remain after market collection');
console.log(JSON.stringify(summary, null, 2));

if (!APPLY) {
  console.log('Dry run only; pass --apply to upsert these source listings into the linked Supabase project.');
  process.exit(0);
}

const tempDirectory = await mkdtemp(path.join(tmpdir(), 'invitation-inventory-'));
try {
  for (let offset = 0, batchNumber = 1; offset < rows.length; offset += WRITE_BATCH_SIZE, batchNumber += 1) {
    await writeBatch(rows.slice(offset, offset + WRITE_BATCH_SIZE), tempDirectory, batchNumber);
    console.log(`Upserted ${Math.min(offset + WRITE_BATCH_SIZE, rows.length)}/${rows.length}`);
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}

console.log(`Inventory sync complete: ${rows.length} source-managed listings upserted.`);