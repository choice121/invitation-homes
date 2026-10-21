create table if not exists public.leasing_applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete restrict,
  primary_applicant_id uuid not null references auth.users (id) on delete restrict,
  reference_code text not null unique,
  status text not null default 'draft' check (status in (
    'draft', 'submitted', 'identity_verification', 'screening',
    'information_requested', 'under_review', 'approved',
    'conditionally_approved', 'denied', 'withdrawn', 'expired'
  )),
  submitted_at timestamptz,
  decision_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leasing_staff_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  role text not null check (role in (
    'leasing_agent', 'leasing_manager', 'finance', 'resident_support', 'administrator'
  )),
  market_slug text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, role, market_slug)
);

create index if not exists leasing_staff_memberships_user_active_idx
  on public.leasing_staff_memberships (user_id, role)
  where active = true;

create index if not exists leasing_applications_applicant_idx
  on public.leasing_applications (primary_applicant_id, created_at desc);

create index if not exists leasing_applications_property_status_idx
  on public.leasing_applications (property_id, status, created_at desc);

create table if not exists public.application_participants (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  first_name text,
  last_name text,
  role text not null check (role in ('primary_applicant', 'co_applicant', 'occupant')),
  status text not null default 'invited' check (status in ('invited', 'started', 'submitted', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, email)
);

create index if not exists application_participants_user_idx
  on public.application_participants (user_id)
  where user_id is not null;

create table if not exists public.application_consents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  participant_id uuid not null references public.application_participants (id) on delete restrict,
  consent_type text not null check (consent_type in (
    'application_terms', 'screening_authorization', 'electronic_records', 'communications'
  )),
  document_version text not null,
  accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (participant_id, consent_type, document_version)
);

create table if not exists public.leasing_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  occurred_at timestamptz not null default now()
);

create index if not exists leasing_application_events_application_idx
  on public.leasing_application_events (application_id, occurred_at desc);

create table if not exists public.leasing_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  status text not null default 'draft' check (status in (
    'draft', 'issued', 'accepted', 'declined', 'expired', 'withdrawn', 'converted'
  )),
  terms_version text not null,
  terms_snapshot jsonb not null check (jsonb_typeof(terms_snapshot) = 'object'),
  issued_at timestamptz,
  expires_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leasing_offers_application_idx
  on public.leasing_offers (application_id, created_at desc);

create table if not exists public.property_holds (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.leasing_offers (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  status text not null default 'payment_pending' check (status in (
    'payment_pending', 'active', 'released', 'expired', 'converted', 'refund_pending', 'refunded'
  )),
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency = upper(currency) and char_length(currency) = 3),
  terms_version text not null,
  terms_snapshot jsonb not null check (jsonb_typeof(terms_snapshot) = 'object'),
  accepted_at timestamptz,
  expires_at timestamptz not null,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id)
);

create unique index if not exists property_holds_one_active_per_property_idx
  on public.property_holds (property_id)
  where status in ('payment_pending', 'active');

create index if not exists property_holds_expiry_idx
  on public.property_holds (expires_at)
  where status in ('payment_pending', 'active');

create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  offer_id uuid not null unique references public.leasing_offers (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  status text not null default 'draft' check (status in (
    'draft', 'offered', 'partially_signed', 'executed', 'active', 'ended', 'void'
  )),
  document_provider text,
  provider_envelope_id text,
  document_version text not null,
  start_date date,
  end_date date,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date > start_date)
);

create index if not exists leases_property_status_idx
  on public.leases (property_id, status);

create table if not exists public.lease_renewal_offers (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  status text not null default 'draft' check (status in (
    'draft', 'issued', 'accepted', 'declined', 'expired', 'withdrawn', 'converted'
  )),
  terms_version text not null,
  terms_snapshot jsonb not null check (jsonb_typeof(terms_snapshot) = 'object'),
  issued_at timestamptz,
  expires_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lease_renewal_offers_lease_idx
  on public.lease_renewal_offers (lease_id, created_at desc);

create table if not exists public.lease_signers (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  participant_id uuid references public.application_participants (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  signer_role text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'signed', 'declined', 'void')),
  provider_signer_id text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_id, email)
);

create table if not exists public.payment_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.leasing_applications (id) on delete restrict,
  offer_id uuid references public.leasing_offers (id) on delete restrict,
  hold_id uuid references public.property_holds (id) on delete restrict,
  lease_id uuid references public.leases (id) on delete restrict,
  entry_type text not null check (entry_type in (
    'application_fee', 'holding_fee', 'security_deposit', 'rent', 'other_charge', 'refund', 'adjustment'
  )),
  entry_status text not null default 'pending' check (entry_status in (
    'pending', 'processing', 'succeeded', 'failed', 'cancelled', 'reversed'
  )),
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency = upper(currency) and char_length(currency) = 3),
  provider text,
  provider_transaction_id text,
  idempotency_key text not null unique,
  related_entry_id uuid references public.payment_ledger_entries (id) on delete restrict,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (application_id is not null or offer_id is not null or hold_id is not null or lease_id is not null)
);

create unique index if not exists payment_ledger_provider_transaction_idx
  on public.payment_ledger_entries (provider, provider_transaction_id)
  where provider is not null and provider_transaction_id is not null;

create index if not exists payment_ledger_application_idx
  on public.payment_ledger_entries (application_id, created_at desc);

create index if not exists payment_ledger_lease_idx
  on public.payment_ledger_entries (lease_id, created_at desc)
  where lease_id is not null;

create table if not exists public.resident_service_requests (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  resident_user_id uuid not null references auth.users (id) on delete restrict,
  reference_code text not null unique,
  category text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'emergency')),
  status text not null default 'submitted' check (status in (
    'submitted', 'triaged', 'scheduled', 'in_progress', 'waiting', 'completed', 'cancelled'
  )),
  description text not null,
  provider_ticket_id text,
  submitted_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resident_service_requests_resident_idx
  on public.resident_service_requests (resident_user_id, created_at desc);

create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users (id) on delete restrict,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  category text not null check (category in ('transactional', 'marketing', 'product_updates')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, channel, category)
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  template_key text not null,
  template_version text not null,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  recipient_user_id uuid references auth.users (id) on delete set null,
  recipient_address text,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in (
    'pending', 'processing', 'sent', 'retry', 'failed', 'suppressed'
  )),
  provider text,
  provider_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  scheduled_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recipient_user_id is not null or recipient_address is not null)
);

create index if not exists notification_outbox_pending_idx
  on public.notification_outbox (scheduled_at, created_at)
  where status in ('pending', 'retry');

create index if not exists notification_outbox_recipient_idx
  on public.notification_outbox (recipient_user_id, created_at desc)
  where recipient_user_id is not null;

create table if not exists public.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notification_outbox (id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  status text not null check (status in ('sent', 'retry', 'failed', 'suppressed')),
  provider_message_id text,
  error_code text,
  attempted_at timestamptz not null default now(),
  unique (notification_id, attempt_number)
);

create index if not exists notification_delivery_attempts_notification_idx
  on public.notification_delivery_attempts (notification_id, attempted_at desc);

alter table public.leasing_applications enable row level security;
alter table public.leasing_staff_memberships enable row level security;
alter table public.application_participants enable row level security;
alter table public.application_consents enable row level security;
alter table public.leasing_application_events enable row level security;
alter table public.leasing_offers enable row level security;
alter table public.lease_renewal_offers enable row level security;
alter table public.property_holds enable row level security;
alter table public.leases enable row level security;
alter table public.lease_signers enable row level security;
alter table public.payment_ledger_entries enable row level security;
alter table public.resident_service_requests enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.notification_delivery_attempts enable row level security;

revoke all on public.leasing_applications, public.application_participants,
  public.leasing_staff_memberships, public.application_consents,
  public.leasing_application_events, public.leasing_offers,
  public.lease_renewal_offers, public.property_holds, public.leases, public.lease_signers,
  public.payment_ledger_entries, public.resident_service_requests, public.notification_preferences,
  public.notification_outbox, public.notification_delivery_attempts
  from public, anon, authenticated;

grant select, insert, update on public.leasing_applications, public.application_participants,
  public.leasing_staff_memberships, public.application_consents,
  public.leasing_application_events, public.leasing_offers,
  public.lease_renewal_offers, public.property_holds, public.leases, public.lease_signers,
  public.payment_ledger_entries, public.resident_service_requests, public.notification_preferences,
  public.notification_outbox, public.notification_delivery_attempts
  to service_role;

revoke update on public.application_consents, public.leasing_application_events,
  public.notification_delivery_attempts
  from service_role;