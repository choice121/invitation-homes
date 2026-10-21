create table if not exists public.leasing_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null,
  market_slug text not null,
  version text not null,
  source_reference text not null,
  policy jsonb not null check (jsonb_typeof(policy) = 'object'),
  effective_from date not null,
  effective_to date,
  approved_by_user_id uuid not null references auth.users (id) on delete restrict,
  approved_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (policy_key, market_slug, version),
  check (effective_to is null or effective_to >= effective_from)
);

create table if not exists public.screening_cases (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  participant_id uuid not null references public.application_participants (id) on delete restrict,
  provider text not null,
  provider_case_id text,
  policy_version_id uuid not null references public.leasing_policy_versions (id) on delete restrict,
  status text not null default 'queued' check (status in (
    'queued', 'submitted', 'processing', 'action_required', 'staff_review',
    'clear', 'eligible_with_conditions', 'ineligible', 'failed', 'cancelled'
  )),
  provider_report_reference text,
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_case_id),
  unique (application_id, participant_id)
);

create index if not exists screening_cases_application_status_idx
  on public.screening_cases (application_id, status);

create table if not exists public.screening_events (
  id uuid primary key default gen_random_uuid(),
  screening_case_id uuid not null references public.screening_cases (id) on delete restrict,
  event_type text not null,
  from_status text,
  to_status text,
  actor_user_id uuid references auth.users (id) on delete set null,
  provider_event_id text,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  occurred_at timestamptz not null default now(),
  unique (provider_event_id)
);

create index if not exists screening_events_case_idx
  on public.screening_events (screening_case_id, occurred_at desc);

create table if not exists public.screening_notice_records (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  participant_id uuid not null references public.application_participants (id) on delete restrict,
  notice_type text not null check (notice_type in (
    'pre_adverse_action', 'adverse_action', 'screening_result', 'other_required_notice'
  )),
  policy_version_id uuid not null references public.leasing_policy_versions (id) on delete restrict,
  template_key text not null,
  template_version text not null,
  delivery_channel text not null check (delivery_channel in ('email', 'postal_mail', 'portal')),
  provider_message_id text,
  issued_at timestamptz not null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists screening_notice_application_idx
  on public.screening_notice_records (application_id, issued_at desc);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  source_entry_id uuid not null references public.payment_ledger_entries (id) on delete restrict,
  target_entry_id uuid not null references public.payment_ledger_entries (id) on delete restrict,
  allocation_type text not null check (allocation_type in (
    'holding_fee_credit', 'rent_credit', 'security_deposit_credit', 'refund', 'other'
  )),
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'USD' check (currency = upper(currency) and char_length(currency) = 3),
  policy_version_id uuid not null references public.leasing_policy_versions (id) on delete restrict,
  reason text not null,
  created_at timestamptz not null default now(),
  check (source_entry_id <> target_entry_id)
);

create index if not exists payment_allocations_source_idx
  on public.payment_allocations (source_entry_id, created_at);

create table if not exists public.security_deposits (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  policy_version_id uuid not null references public.leasing_policy_versions (id) on delete restrict,
  payment_entry_id uuid not null unique references public.payment_ledger_entries (id) on delete restrict,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency = upper(currency) and char_length(currency) = 3),
  status text not null default 'due' check (status in (
    'due', 'payment_pending', 'held', 'disposition_pending', 'partially_refunded',
    'refunded', 'applied', 'disputed'
  )),
  received_at timestamptz,
  disposition_due_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_id)
);

create table if not exists public.security_deposit_dispositions (
  id uuid primary key default gen_random_uuid(),
  security_deposit_id uuid not null references public.security_deposits (id) on delete restrict,
  policy_version_id uuid not null references public.leasing_policy_versions (id) on delete restrict,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in (
    'draft', 'issued', 'disputed', 'finalized', 'void'
  )),
  itemization jsonb not null default '[]'::jsonb check (jsonb_typeof(itemization) = 'array'),
  refund_amount numeric(10, 2) not null default 0 check (refund_amount >= 0),
  retained_amount numeric(10, 2) not null default 0 check (retained_amount >= 0),
  due_at timestamptz,
  issued_at timestamptz,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (security_deposit_id, version)
);

create table if not exists public.lease_documents (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  document_type text not null check (document_type in (
    'lease', 'addendum', 'disclosure', 'renewal', 'move_in_inspection', 'other'
  )),
  provider text not null,
  provider_envelope_id text,
  provider_document_id text,
  secure_storage_reference text,
  document_version text not null,
  status text not null default 'draft' check (status in (
    'draft', 'sent', 'partially_signed', 'executed', 'declined', 'void'
  )),
  sent_at timestamptz,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_envelope_id, document_type)
);

create index if not exists lease_documents_lease_idx
  on public.lease_documents (lease_id, created_at desc);

create table if not exists public.lease_events (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete restrict,
  event_type text not null,
  from_status text,
  to_status text,
  actor_user_id uuid references auth.users (id) on delete set null,
  provider_event_id text,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  occurred_at timestamptz not null default now(),
  unique (provider_event_id)
);

create index if not exists lease_events_lease_idx
  on public.lease_events (lease_id, occurred_at desc);

alter table public.leasing_policy_versions enable row level security;
alter table public.screening_cases enable row level security;
alter table public.screening_events enable row level security;
alter table public.screening_notice_records enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.security_deposits enable row level security;
alter table public.security_deposit_dispositions enable row level security;
alter table public.lease_documents enable row level security;
alter table public.lease_events enable row level security;

revoke all on public.leasing_policy_versions, public.screening_cases, public.screening_events,
  public.screening_notice_records, public.payment_allocations, public.security_deposits,
  public.security_deposit_dispositions, public.lease_documents, public.lease_events
  from public, anon, authenticated;

grant select, insert, update on public.screening_cases, public.security_deposits,
  public.security_deposit_dispositions, public.lease_documents
  to service_role;

grant select, insert on public.leasing_policy_versions, public.screening_events,
  public.screening_notice_records, public.payment_allocations, public.lease_events
  to service_role;