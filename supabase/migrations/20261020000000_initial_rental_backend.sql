create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  address text not null,
  city text not null,
  state text not null check (char_length(state) between 2 and 3),
  zip_code text not null,
  market text not null,
  monthly_rent numeric(10, 2) not null check (monthly_rent >= 0),
  security_deposit numeric(10, 2) not null default 0 check (security_deposit >= 0),
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms numeric(3, 1) not null check (bathrooms >= 0),
  square_feet integer not null check (square_feet >= 0),
  available_date text,
  status text not null default 'draft' check (status in ('draft', 'available', 'pending', 'coming_soon', 'leased')),
  pet_friendly boolean not null default false,
  pet_details text not null default '',
  smart_home boolean not null default false,
  smart_home_features text[] not null default '{}',
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  featured_image text not null,
  virtual_tour_url text,
  floor_plan_image text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  year_built integer,
  parking_spaces integer,
  school_district text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_public_market_idx
  on public.properties (market, status)
  where published = true;

create index if not exists properties_public_rent_idx
  on public.properties (monthly_rent)
  where published = true;

create index if not exists properties_public_bedrooms_idx
  on public.properties (bedrooms)
  where published = true;

alter table public.properties enable row level security;

create policy "Public can read published rental inventory"
  on public.properties
  for select
  to anon, authenticated
  using (published = true and status in ('available', 'pending', 'coming_soon'));

create table if not exists public.saved_properties (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

alter table public.saved_properties enable row level security;

create policy "Residents can read their saved properties"
  on public.saved_properties for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Residents can save properties to their own account"
  on public.saved_properties for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Residents can remove their saved properties"
  on public.saved_properties for delete to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Saved search',
  filters jsonb not null default '{}'::jsonb check (jsonb_typeof(filters) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_searches_user_created_idx
  on public.saved_searches (user_id, created_at desc);

alter table public.saved_searches enable row level security;

create policy "Residents can read their saved searches"
  on public.saved_searches for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Residents can create their own saved searches"
  on public.saved_searches for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Residents can update their own saved searches"
  on public.saved_searches for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Residents can delete their own saved searches"
  on public.saved_searches for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.properties from public, anon, authenticated;
revoke all on public.saved_properties, public.saved_searches from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.properties to anon, authenticated;
grant select, insert, delete on public.saved_properties to authenticated;
grant select, insert, update, delete on public.saved_searches to authenticated;

create or replace function public.search_public_properties(
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
  with matching_properties as (
    select p.*
    from public.properties p
    where p.published = true
      and p.status in ('available', 'pending', 'coming_soon')
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
    p.slug, p.title, p.address, p.city, p.state, p.zip_code, p.market,
    p.monthly_rent, p.security_deposit, p.bedrooms, p.bathrooms,
    p.square_feet, p.available_date, p.status, p.pet_friendly, p.pet_details,
    p.smart_home, p.smart_home_features, p.amenities, p.images,
    p.featured_image, p.virtual_tour_url, p.floor_plan_image,
    p.latitude, p.longitude, p.year_built, p.parking_spaces, p.school_district,
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

revoke all on function public.search_public_properties(
  text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.search_public_properties(
  text, numeric, numeric, integer, numeric, integer, integer,
  boolean, boolean, text, integer, integer
) to anon, authenticated;