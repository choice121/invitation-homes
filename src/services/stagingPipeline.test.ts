import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getStagedProperties,
  addStagedProperty,
  updateStagedStatus,
  publishStagedProperty,
  scrapePublicListingUrl
} from './stagingPipeline';

test('staged properties queue initializes and supports additions', async () => {
  const initial = await getStagedProperties();
  assert.ok(initial.length >= 3, 'initial staged queue has records');

  const added = await addStagedProperty({
    sourceUrl: 'https://www.zillow.com/homedetails/test-house/12345_zpid/',
    sourcePlatform: 'Zillow',
    title: '3 bed home in Atlanta test',
    address: '500 Peachtree St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30308',
    market: 'Atlanta',
    monthlyRent: 2300,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    petFriendly: true,
    smartHome: true,
    images: ['https://example.com/photo.jpg'],
    featuredImage: 'https://example.com/photo.jpg',
    description: 'Test staging description'
  });

  assert.equal(added.stagingStatus, 'pending_review');
  assert.equal(added.address, '500 Peachtree St');

  const afterAdd = await getStagedProperties();
  const found = afterAdd.find((p) => p.id === added.id);
  assert.ok(found, 'added staged property is retrievable');
});

test('staged listing can be approved, published, or rejected', async () => {
  const testListing = await addStagedProperty({
    sourceUrl: 'https://www.realtor.com/realestateandhomes-detail/test-property',
    sourcePlatform: 'Realtor.com',
    title: '4 bed home in Dallas',
    address: '880 Elm Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    market: 'Dallas-Fort Worth',
    monthlyRent: 2600,
    bedrooms: 4,
    bathrooms: 2.5,
    squareFeet: 2200,
    petFriendly: true,
    smartHome: true,
    images: [],
    featuredImage: 'https://example.com/img.jpg',
    description: 'Great family home'
  });

  const publishRes = await publishStagedProperty(testListing.id);
  assert.equal(publishRes.success, true);
  assert.ok(publishRes.property);
  assert.equal(publishRes.property.address, '880 Elm Street');

  const rejectListing = await addStagedProperty({
    sourceUrl: 'https://www.redfin.com/test-reject',
    sourcePlatform: 'Redfin',
    title: '2 bed home in Phoenix',
    address: '100 Camelback Rd',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85012',
    market: 'Phoenix',
    monthlyRent: 1900,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 1100,
    petFriendly: false,
    smartHome: false,
    images: [],
    featuredImage: '',
    description: 'Reject test'
  });

  await updateStagedStatus(rejectListing.id, 'rejected');
  const queue = await getStagedProperties();
  const rejectedRecord = queue.find((p) => p.id === rejectListing.id);
  assert.equal(rejectedRecord?.stagingStatus, 'rejected');
});

test('public listing URL scraper extracts heuristic metadata', async () => {
  const parsed = await scrapePublicListingUrl('https://www.zillow.com/homedetails/4819-Windsor-Ridge-Dr-Marietta-GA-30068/35892144_zpid/');
  assert.equal(parsed.sourcePlatform, 'Zillow');
  assert.ok(parsed.monthlyRent && parsed.monthlyRent > 0);
  assert.ok(parsed.bedrooms && parsed.bedrooms >= 1);
  assert.ok(parsed.address);
});
