-- Additive migration: Staged Properties Pipeline, Manual Payment Tracking, Leases, Inspections, and Audit Logs

create table if not exists public.staged_properties (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  source_platform text not null default 'manual_or_extension',
  title text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  market text not null,
  monthly_rent numeric(10, 2) not null check (monthly_rent > 0),
  security_deposit numeric(10, 2),
  bedrooms integer not null default 3 check (bedrooms >= 0),
  bathrooms numeric(3, 1) not null default 2 check (bathrooms >= 0),
  square_feet integer not null default 1500 check (square_feet >= 0),
  pet_friendly boolean not null default true,
  smart_home boolean not null default true,
  images jsonb not null default '[]'::jsonb,
  featured_image text,
  description text,
  staging_status text not null default 'pending_review' check (staging_status in ('pending_review', 'approved', 'published', 'rejected')),
  raw_payload jsonb default '{}'::jsonb,
  published_property_id uuid references public.properties(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_payment_records (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.leasing_applications(id) on delete cascade,
  payment_type text not null check (payment_type in ('application_fee', 'holding_deposit', 'first_month_rent', 'pet_fee')),
  method text not null check (method in ('Zelle', 'Venmo', 'Cash App', 'Credit Card', 'ACH Transfer', 'Cashier Check', 'Other')),
  handle text,
  reference_code text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'verified' check (status in ('pending', 'verified', 'waived', 'refunded')),
  verified_by text not null default 'Leasing Staff',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.lease_agreements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.leasing_applications(id) on delete set null,
  property_id uuid references public.properties(id) on delete restrict,
  property_address text not null,
  tenant_name text not null,
  tenant_email text not null,
  monthly_rent numeric(10, 2) not null check (monthly_rent > 0),
  security_deposit numeric(10, 2) not null check (security_deposit >= 0),
  lease_term_months integer not null default 12,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft', 'sent_to_tenant', 'tenant_signed', 'countersigned', 'active', 'terminated')),
  tenant_signed_at timestamptz,
  countersigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_inspections (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  property_address text not null,
  tenant_name text not null,
  tenant_email text not null,
  type text not null check (type in ('move_in', 'move_out', 'routine')),
  inspection_date date not null default current_date,
  checklist jsonb not null default '[]'::jsonb,
  overall_condition text not null check (overall_condition in ('excellent', 'good', 'fair', 'needs_attention')),
  notes text,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewed', 'signed')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_event_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  actor_role text not null default 'staff',
  actor_id text not null default 'staff_portal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.staged_properties enable row level security;
alter table public.manual_payment_records enable row level security;
alter table public.lease_agreements enable row level security;
alter table public.property_inspections enable row level security;
alter table public.audit_event_logs enable row level security;

-- Public can view published properties, service role has full access
grant select, insert, update on public.staged_properties, public.manual_payment_records, public.lease_agreements, public.property_inspections, public.audit_event_logs to service_role;
