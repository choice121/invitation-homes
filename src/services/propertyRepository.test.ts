import assert from 'node:assert/strict';
import test from 'node:test';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { buildImageKitUrl, getPropertyImages } from '../lib/propertyImages';
import { mapProperty, searchPropertyListings } from './propertyRepository';
import { ListingSearchParams } from './propertyRepository';

const defaultParams: ListingSearchParams = {
  query: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'any',
  bathrooms: 'any',
  minSqft: '',
  maxSqft: '',
  petFriendly: false,
  smartHome: false,
  sortOrder: 'recommended',
  page: 1,
  pageSize: 12
};

test('search applies location, price, bedroom, pet, and smart-home filters', async () => {
  const result = await searchPropertyListings({
    ...defaultParams,
    query: 'Atlanta',
    minPrice: '2400',
    maxPrice: '2500',
    bedrooms: '4',
    petFriendly: true,
    smartHome: true
  });

  assert.deepEqual(result.listings.map((listing) => listing.id), ['invh-atl-101']);
  assert.equal(result.totalCount, 1);
});

test('search sorts and paginates the matching homes', async () => {
  const result = await searchPropertyListings({
    ...defaultParams,
    sortOrder: 'price_desc',
    page: 1,
    pageSize: 2
  });

  assert.deepEqual(result.listings.map((listing) => listing.id), ['invh-atx-404', 'invh-phx-303']);
  assert.equal(result.totalCount, SAMPLE_PROPERTIES.length);
});

test('property images use the featured image when the gallery is empty', () => {
  assert.deepEqual(getPropertyImages([], ' https://images.example/home.jpg '), ['https://images.example/home.jpg']);
  assert.deepEqual(getPropertyImages(['a.jpg', 'a.jpg'], 'a.jpg'), ['a.jpg']);
  assert.deepEqual(getPropertyImages([], ''), []);
});

test('ImageKit transforms only approved source-origin images', () => {
  assert.equal(
    buildImageKitUrl('https://images.invitationhomes.com/web/home.jpg', 'https://ik.imagekit.io/demo'),
    'https://ik.imagekit.io/demo/tr:w-1200,q-auto,f-auto/web/home.jpg'
  );
  assert.equal(
    buildImageKitUrl('https://third-party.example/home.jpg', 'https://ik.imagekit.io/demo'),
    'https://third-party.example/home.jpg'
  );
});

test('database property UUID is retained separately from the public slug', () => {
  const listing = mapProperty({
    id: '7081b2ca-ef96-4ad0-a4d6-2aed2f2ad6ce',
    property_id: '7081b2ca-ef96-4ad0-a4d6-2aed2f2ad6ce',
    slug: 'atlanta-home',
    title: 'Atlanta home',
    address: '1 Main St',
    city: 'Atlanta',
    state: 'GA',
    zip_code: '30301',
    market: 'Atlanta',
    monthly_rent: 2000,
    security_deposit: 2000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    available_date: null,
    status: 'available',
    pet_friendly: true,
    pet_details: '',
    smart_home: false,
    smart_home_features: [],
    amenities: [],
    images: [],
    featured_image: 'https://images.example/home.jpg',
    virtual_tour_url: null,
    floor_plan_image: null,
    latitude: 33.75,
    longitude: -84.39,
    year_built: null,
    parking_spaces: null,
    school_district: null
  });

  assert.equal(listing.id, 'atlanta-home');
  assert.equal(listing.databaseId, '7081b2ca-ef96-4ad0-a4d6-2aed2f2ad6ce');
  assert.deepEqual(listing.images, ['https://images.example/home.jpg']);
});