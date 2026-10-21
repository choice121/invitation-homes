import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const auditId = randomUUID();
const publishedPetId = randomUUID();
const publishedOtherId = randomUUID();
const unpublishedId = randomUUID();
const market = `audit-inventory-${auditId}`;
const marketSlug = `audit-market-${auditId}`;
const wrongMarketSlug = `other-market-${auditId}`;
const publishedPetSlug = `audit-published-pet-${auditId}`;

const sql = `
begin;
insert into public.properties (
  id, source_market_slug, slug, title, address, city, state, zip_code, market, monthly_rent,
  security_deposit, bedrooms, bathrooms, square_feet, status, pet_friendly,
  featured_image, latitude, longitude, published
) values
  ('${publishedPetId}', '${marketSlug}', '${publishedPetSlug}', 'Audit published pet listing', '1 Audit Way', 'Audit Inventory', 'ZZ', '00001', '${market}', 2500, 2500, 3, 2, 1500, 'available', true, 'https://example.invalid/audit-pet.jpg', 33.75, -84.39, true),
  ('${publishedOtherId}', '${marketSlug}', 'audit-published-other-${auditId}', 'Audit published listing', '2 Audit Way', 'Audit Inventory', 'ZZ', '00002', '${market}', 3500, 3500, 4, 2, 2000, 'available', false, 'https://example.invalid/audit-other.jpg', 33.75, -84.39, true),
  ('${unpublishedId}', '${marketSlug}', 'audit-unpublished-${auditId}', 'Audit unpublished listing', '3 Audit Way', 'Audit Inventory', 'ZZ', '00003', '${market}', 1500, 1500, 2, 1, 900, 'available', true, 'https://example.invalid/audit-hidden.jpg', 33.75, -84.39, false);
set local role anon;
select
  (select count(*)::integer from public.search_public_properties_v3('${market}', null, null, null, null, null, null, null, false, false, 'recommended', 1, 20)) as published_count,
  (select count(*)::integer from public.search_public_properties_v3('${market}', null, 3000, null, null, null, null, null, false, false, 'recommended', 1, 20)) as min_rent_count,
  (select count(*)::integer from public.search_public_properties_v3('${market}', null, null, null, null, null, null, null, true, false, 'recommended', 1, 20)) as pet_friendly_count,
  (select property_id::text from public.search_public_properties_v3('${market}', null, null, null, null, null, null, null, false, false, 'recommended', 1, 20) where slug = '${publishedPetSlug}') as property_id,
  (select count(*)::integer from public.search_public_properties_v3(null, '${marketSlug}', null, null, null, null, null, null, false, false, 'recommended', 1, 20)) as market_slug_count,
  (select count(*)::integer from public.search_public_properties_v3(null, '${wrongMarketSlug}', null, null, null, null, null, null, false, false, 'recommended', 1, 20)) as wrong_market_slug_count;
reset role;
rollback;
`;

const output = execFileSync('npx', [
  '--yes',
  'supabase@latest',
  '--output-format',
  'json',
  'db',
  'query',
  '--linked',
  sql
], { encoding: 'utf8' });

const jsonStart = Math.min(...[output.indexOf('['), output.indexOf('{')].filter((idx) => idx >= 0));
const jsonEnd = Math.max(output.lastIndexOf(']'), output.lastIndexOf('}'));
assert.ok(jsonStart >= 0 && jsonEnd > jsonStart, 'Supabase CLI returned no JSON result');
const parsed = JSON.parse(output.slice(jsonStart, jsonEnd + 1));
const row = Array.isArray(parsed) ? parsed[0] : (parsed.rows ? parsed.rows[0] : parsed);

assert.ok(row, 'Supabase query returned no result row');
assert.equal(row.published_count, 2, 'search should hide unpublished listings');
assert.equal(row.min_rent_count, 1, 'minimum rent filter should match one listing');
assert.equal(row.pet_friendly_count, 1, 'pet-friendly filter should match one listing');
assert.equal(row.property_id, publishedPetId, 'search should return the database UUID');
assert.equal(row.market_slug_count, 2, 'market slug filter should return only its market listings');
assert.equal(row.wrong_market_slug_count, 0, 'market slug filter should exclude other markets');

console.log('Supabase transaction tests passed; temporary fixtures were rolled back.');