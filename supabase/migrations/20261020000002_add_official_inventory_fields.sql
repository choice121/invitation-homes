alter table public.properties
  alter column security_deposit drop not null,
  add column if not exists source_id text,
  add column if not exists source_market_slug text,
  add column if not exists source_status text,
  add column if not exists total_monthly_rent numeric(10, 2),
  add column if not exists description text,
  add column if not exists fees jsonb not null default '[]'::jsonb check (jsonb_typeof(fees) = 'array'),
  add column if not exists lease_terms jsonb not null default '[]'::jsonb check (jsonb_typeof(lease_terms) = 'array'),
  add column if not exists floor_plan_images text[] not null default '{}',
  add column if not exists schools jsonb not null default '[]'::jsonb check (jsonb_typeof(schools) = 'array'),
  add column if not exists disclosures text[] not null default '{}',
  add column if not exists application_url text,
  add column if not exists virtual_tour_url text,
  add column if not exists property_type text,
  add column if not exists has_pool boolean not null default false,
  add column if not exists synced_at timestamptz;

create unique index if not exists properties_source_id_unique_idx
  on public.properties (source_id)
  where source_id is not null;

create index if not exists properties_source_market_published_idx
  on public.properties (source_market_slug, status)
  where published = true;

drop function public.search_public_properties_v2(
  text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
);

create function public.search_public_properties_v2(
  p_query text,
  p_min_price numeric,
  p_max_price numeric,
  p_bedrooms integer,
  p_bathrooms numeric,
  p_min_sqft integer,
  p_max_sqft integer,
  p_pet_friendly boolean,
  p_smart_home boolean,
  p_sort_order text,
  p_page integer,
  p_page_size integer
)
returns table (
  property_id uuid,
  source_id text,
  source_market_slug text,
  source_status text,
  slug text,
  title text,
  address text,
  city text,
  state text,
  zip_code text,
  market text,
  monthly_rent numeric,
  security_deposit numeric,
  total_monthly_rent numeric,
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  available_date text,
  status text,
  pet_friendly boolean,
  pet_details text,
  smart_home boolean,
  smart_home_features text[],
  amenities text[],
  images text[],
  featured_image text,
  virtual_tour_url text,
  floor_plan_image text,
  floor_plan_images text[],
  description text,
  fees jsonb,
  lease_terms jsonb,
  schools jsonb,
  disclosures text[],
  application_url text,
  property_type text,
  has_pool boolean,
  latitude double precision,
  longitude double precision,
  year_built integer,
  parking_spaces integer,
  school_district text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $function$
  select
    p.id, p.source_id, p.source_market_slug, p.source_status,
    result.slug, result.title, result.address, result.city, result.state,
    result.zip_code, result.market, result.monthly_rent, p.security_deposit,
    p.total_monthly_rent, result.bedrooms, result.bathrooms, result.square_feet,
    result.available_date, result.status, result.pet_friendly, result.pet_details,
    result.smart_home, result.smart_home_features, result.amenities, result.images,
    result.featured_image, result.virtual_tour_url, result.floor_plan_image,
    p.floor_plan_images, p.description, p.fees, p.lease_terms, p.schools,
    p.disclosures, p.application_url, p.property_type, p.has_pool,
    result.latitude, result.longitude, result.year_built, result.parking_spaces,
    result.school_district, result.total_count
  from public.search_public_properties(
    p_query, p_min_price, p_max_price, p_bedrooms, p_bathrooms, p_min_sqft,
    p_max_sqft, p_pet_friendly, p_smart_home, p_sort_order, p_page, p_page_size
  ) as result
  join public.properties p on p.slug = result.slug
  order by
    case when p_sort_order = 'price_asc' then result.monthly_rent end asc nulls last,
    case when p_sort_order = 'price_desc' then result.monthly_rent end desc nulls last,
    case when p_sort_order = 'beds_desc' then result.bedrooms end desc nulls last,
    p.created_at desc;
$function$;

revoke all on function public.search_public_properties_v2(
  text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.search_public_properties_v2(
  text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) to anon, authenticated;