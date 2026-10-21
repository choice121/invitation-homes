create or replace function public.search_public_properties_v2(
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
  slug text,
  title text,
  address text,
  city text,
  state text,
  zip_code text,
  market text,
  monthly_rent numeric,
  security_deposit numeric,
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
    p.id, result.slug, result.title, result.address, result.city, result.state,
    result.zip_code, result.market, result.monthly_rent, result.security_deposit,
    result.bedrooms, result.bathrooms, result.square_feet, result.available_date,
    result.status, result.pet_friendly, result.pet_details, result.smart_home,
    result.smart_home_features, result.amenities, result.images,
    result.featured_image, result.virtual_tour_url, result.floor_plan_image,
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