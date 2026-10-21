import { SAMPLE_PROPERTIES } from '../data/properties';
import { PropertyListing } from '../types/rental';
import { supabaseClient } from '../lib/supabaseClient';
import { getImageDeliveryUrl, getPropertyImages } from '../lib/propertyImages';

interface PropertyRecord {
  id?: string;
  property_id?: string;
  source_id?: string | null;
  source_market_slug?: string | null;
  source_status?: string | null;
  slug: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  market: string;
  monthly_rent: number;
  security_deposit: number | null;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  available_date: string | null;
  status: string;
  pet_friendly: boolean;
  pet_details: string;
  smart_home: boolean;
  smart_home_features: string[];
  amenities: string[];
  images: string[];
  featured_image: string;
  virtual_tour_url: string | null;
  floor_plan_image: string | null;
  latitude: number;
  longitude: number;
  year_built: number | null;
  parking_spaces: number | null;
  school_district: string | null;
  total_monthly_rent?: number | null;
  description?: string | null;
  fees?: { name: string; title: string; description: string; fee_amount: string | number; is_required: boolean; frequency: string }[] | null;
  lease_terms?: { term: number; rent: string | number; total_monthly_rent: string | number; is_optimal_term: boolean }[] | null;
  floor_plan_images?: string[] | null;
  schools?: { name: string; distance: number | null; grade_level_description: string | null }[] | null;
  disclosures?: string[] | null;
  application_url?: string | null;
  property_type?: string | null;
  has_pool?: boolean | null;
  total_count?: number;
}

export interface ListingSearchParams {
  query: string;
  marketSlug?: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minSqft: string;
  maxSqft: string;
  petFriendly: boolean;
  smartHome: boolean;
  sortOrder: string;
  page: number;
  pageSize: number;
}

export interface ListingSearchResult {
  listings: PropertyListing[];
  totalCount: number;
}

function mapListingStatus(status: string): PropertyListing['status'] {
  if (status === 'available' || status === 'Vacant Unrented Ready') return 'available';
  if (status === 'coming_soon' || status === 'Vacant Unrented Not Ready') return 'coming_soon';
  if (status === 'leased') return 'leased';
  return 'pending';
}

export function mapProperty(record: PropertyRecord): PropertyListing {
  return {
    id: record.slug,
    databaseId: record.property_id ?? record.id,
    sourceId: record.source_id ?? undefined,
    sourceMarketSlug: record.source_market_slug ?? undefined,
    sourceStatus: record.source_status ?? undefined,
    title: record.title,
    address: record.address,
    city: record.city,
    state: record.state,
    zipCode: record.zip_code,
    market: record.market,
    monthlyRent: Number(record.monthly_rent),
    securityDeposit: record.security_deposit == null ? null : Number(record.security_deposit),
    totalMonthlyRent: record.total_monthly_rent == null ? undefined : Number(record.total_monthly_rent),
    description: record.description ?? undefined,
    fees: record.fees?.map((fee) => ({
      name: fee.name,
      title: fee.title,
      description: fee.description,
      amount: Number(fee.fee_amount),
      required: fee.is_required,
      frequency: fee.frequency
    })),
    leaseTerms: record.lease_terms?.map((term) => ({
      term: term.term,
      rent: Number(term.rent),
      totalMonthlyRent: Number(term.total_monthly_rent),
      optimal: term.is_optimal_term
    })),
    floorPlanImages: record.floor_plan_images?.map(getImageDeliveryUrl),
    schools: record.schools?.map((school) => ({
      name: school.name,
      distance: school.distance,
      gradeLevel: school.grade_level_description
    })),
    disclosures: record.disclosures ?? undefined,
    applicationUrl: record.application_url ?? undefined,
    propertyType: record.property_type ?? undefined,
    hasPool: record.has_pool ?? undefined,
    bedrooms: record.bedrooms,
    bathrooms: Number(record.bathrooms),
    squareFeet: record.square_feet,
    availableDate: record.available_date ?? 'Contact for availability',
    status: mapListingStatus(record.status),
    petFriendly: record.pet_friendly,
    petDetails: record.pet_details,
    smartHome: record.smart_home,
    smartHomeFeatures: record.smart_home_features,
    amenities: record.amenities,
    images: getPropertyImages(record.images, record.featured_image),
    featuredImage: getImageDeliveryUrl(record.featured_image),
    virtualTourUrl: record.virtual_tour_url ?? undefined,
    floorPlanImage: record.floor_plan_image ? getImageDeliveryUrl(record.floor_plan_image) : undefined,
    coordinates: { lat: record.latitude, lng: record.longitude },
    yearBuilt: record.year_built ?? undefined,
    parkingSpaces: record.parking_spaces ?? undefined,
    schoolDistrict: record.school_district ?? undefined
  };
}

function searchFixtureListings(params: ListingSearchParams): ListingSearchResult {
  const matching = SAMPLE_PROPERTIES.filter((home) => {
    const queryMatches = !params.query || `${home.city} ${home.state} ${home.zipCode} ${home.address}`.toLowerCase().includes(params.query.toLowerCase());
    const bedsMatch = params.bedrooms === 'any' || home.bedrooms >= Number(params.bedrooms);
    const bathsMatch = params.bathrooms === 'any' || home.bathrooms >= Number(params.bathrooms);
    const minPriceMatch = !params.minPrice || home.monthlyRent >= Number(params.minPrice);
    const maxPriceMatch = !params.maxPrice || home.monthlyRent <= Number(params.maxPrice);
    const minSqftMatch = !params.minSqft || home.squareFeet >= Number(params.minSqft);
    const maxSqftMatch = !params.maxSqft || home.squareFeet <= Number(params.maxSqft);
    return queryMatches && bedsMatch && bathsMatch && minPriceMatch && maxPriceMatch && minSqftMatch && maxSqftMatch && (!params.petFriendly || home.petFriendly) && (!params.smartHome || home.smartHome);
  }).sort((first, second) => {
    if (params.sortOrder === 'price_asc') return first.monthlyRent - second.monthlyRent;
    if (params.sortOrder === 'price_desc') return second.monthlyRent - first.monthlyRent;
    if (params.sortOrder === 'beds_desc') return second.bedrooms - first.bedrooms;
    return 0;
  });

  const start = Math.max(0, params.page - 1) * params.pageSize;
  return { listings: matching.slice(start, start + params.pageSize), totalCount: matching.length };
}

export async function searchPropertyListings(params: ListingSearchParams): Promise<ListingSearchResult> {
  if (!supabaseClient) return searchFixtureListings(params);

  const { data, error } = await supabaseClient.rpc('search_public_properties_v3', {
    p_query: params.query.trim() || null,
    p_market_slug: params.marketSlug ?? null,
    p_min_price: params.minPrice ? Number(params.minPrice) : null,
    p_max_price: params.maxPrice ? Number(params.maxPrice) : null,
    p_bedrooms: params.bedrooms === 'any' ? null : Number(params.bedrooms),
    p_bathrooms: params.bathrooms === 'any' ? null : Number(params.bathrooms),
    p_min_sqft: params.minSqft ? Number(params.minSqft) : null,
    p_max_sqft: params.maxSqft ? Number(params.maxSqft) : null,
    p_pet_friendly: params.petFriendly,
    p_smart_home: params.smartHome,
    p_sort_order: params.sortOrder,
    p_page: params.page,
    p_page_size: params.pageSize
  });

  if (error) throw error;
  const rows = (data ?? []) as PropertyRecord[];
  return {
    listings: rows.map(mapProperty),
    totalCount: Number(rows[0]?.total_count ?? 0)
  };
}

export async function getPropertyBySlug(slug: string): Promise<PropertyListing | null> {
  if (!supabaseClient) return SAMPLE_PROPERTIES.find((property) => property.id === slug) ?? null;

  const { data, error } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .in('status', ['available', 'pending', 'coming_soon'])
    .maybeSingle();

  if (error) throw error;
  return data ? mapProperty(data as PropertyRecord) : null;
}