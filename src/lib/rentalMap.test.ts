import assert from 'node:assert/strict';
import test from 'node:test';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { PropertyListing } from '../types/rental';
import {
  buildMarkerTitle,
  buildPopupHtml,
  DEFAULT_MAP_TILE_ATTRIBUTION,
  DEFAULT_MAP_TILE_URL,
  escapeHtml,
  formatMonthlyRent,
  getMappableHomes
} from '../lib/rentalMap';

function makeListing(overrides: Partial<PropertyListing> = {}): PropertyListing {
  return {
    ...SAMPLE_PROPERTIES[0],
    id: 'test-listing',
    address: '123 Test Street',
    city: 'Atlanta',
    state: 'GA',
    monthlyRent: 2450,
    coordinates: { lat: 33.749, lng: -84.388 },
    ...overrides
  };
}

test('default map tiles are keyless OpenStreetMap tiles', () => {
  assert.equal(DEFAULT_MAP_TILE_URL, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assert.match(DEFAULT_MAP_TILE_ATTRIBUTION, /openstreetmap\.org\/copyright/);
});

test('listings without usable coordinates are excluded from the map', () => {
  const homes = [
    makeListing({ id: 'valid' }),
    makeListing({ id: 'no-coordinates', coordinates: undefined as unknown as PropertyListing['coordinates'] }),
    makeListing({ id: 'nan-lat', coordinates: { lat: Number.NaN, lng: -84.388 } }),
    makeListing({ id: 'out-of-range', coordinates: { lat: 120, lng: -84.388 } })
  ];

  assert.deepEqual(getMappableHomes(homes).map((home) => home.id), ['valid']);
});

test('monthly rent is formatted for the price pin', () => {
  assert.equal(formatMonthlyRent(2450), '$2,450');
  assert.equal(formatMonthlyRent(1200), '$1,200');
});

test('listing text is escaped before it is injected into map popups', () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml("O'Brien & Co"), 'O&#39;Brien &amp; Co');
});

test('popup html escapes listing text and links to the property route', () => {
  const html = buildPopupHtml(
    makeListing({ id: 'invh-atl-101', address: '<b>Evil</b> Street', city: "O'Town" })
  );

  assert.ok(!html.includes('<b>Evil</b>'));
  assert.ok(html.includes('&lt;b&gt;Evil&lt;/b&gt;'));
  assert.ok(html.includes('O&#39;Town'));
  assert.ok(html.includes('/houses-for-rent/invh-atl-101'));
  assert.ok(html.includes('$2,450/mo'));
});

test('marker title carries the address, city, and monthly rent', () => {
  const title = buildMarkerTitle(makeListing());
  assert.equal(title, '123 Test Street, Atlanta: $2,450 per month');
});
