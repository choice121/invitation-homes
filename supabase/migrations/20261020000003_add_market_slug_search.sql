create function public.search_public_properties_v3(
  p_query text,
  p_market_slug text,
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
  with matching_properties as (
    select p.*
    from public.properties p
    where p.published = true
      and p.status in ('available', 'pending', 'coming_soon')
      and (nullif(btrim(p_market_slug), '') is null or p.source_market_slug = btrim(p_market_slug))
      and (
        nullif(btrim(p_query), '') is null
        or p.address ilike '%' || btrim(p_query) || '%'
        or p.city ilike '%' || btrim(p_query) || '%'
        or p.state ilike '%' || btrim(p_query) || '%'
        or p.zip_code ilike '%' || btrim(p_query) || '%'
        or p.market ilike '%' || btrim(p_query) || '%'
      )
      and (p_min_price is null or p.monthly_rent >= p_min_price)
      and (p_max_price is null or p.monthly_rent <= p_max_price)
      and (p_bedrooms is null or p.bedrooms >= p_bedrooms)
      and (p_bathrooms is null or p.bathrooms >= p_bathrooms)
      and (p_min_sqft is null or p.square_feet >= p_min_sqft)
      and (p_max_sqft is null or p.square_feet <= p_max_sqft)
      and (not p_pet_friendly or p.pet_friendly)
      and (not p_smart_home or p.smart_home)
  )
  select
    p.id, p.source_id, p.source_market_slug, p.source_status, p.slug, p.title,
    p.address, p.city, p.state, p.zip_code, p.market, p.monthly_rent,
    p.security_deposit, p.total_monthly_rent, p.bedrooms, p.bathrooms,
    p.square_feet, p.available_date, p.status, p.pet_friendly, p.pet_details,
    p.smart_home, p.smart_home_features, p.amenities, p.images,
    p.featured_image, p.virtual_tour_url, p.floor_plan_image,
    p.floor_plan_images, p.description, p.fees, p.lease_terms, p.schools,
    p.disclosures, p.application_url, p.property_type, p.has_pool, p.latitude,
    p.longitude, p.year_built, p.parking_spaces, p.school_district,
    count(*) over () as total_count
  from matching_properties p
  order by
    case when p_sort_order = 'price_asc' then p.monthly_rent end asc nulls last,
    case when p_sort_order = 'price_desc' then p.monthly_rent end desc nulls last,
    case when p_sort_order = 'beds_desc' then p.bedrooms end desc nulls last,
    p.created_at desc
  limit greatest(1, least(coalesce(p_page_size, 12), 100))
  offset (greatest(coalesce(p_page, 1), 1) - 1) * greatest(1, least(coalesce(p_page_size, 12), 100));
$function$;

revoke all on function public.search_public_properties_v3(
  text, text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.search_public_properties_v3(
  text, text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) to anon, authenticated;