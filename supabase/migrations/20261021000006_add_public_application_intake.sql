alter table public.leasing_applications
  alter column primary_applicant_id drop not null,
  add column if not exists submission_key uuid unique,
  add column if not exists email_verified_at timestamptz;

create table if not exists public.application_contact_details (
  application_id uuid primary key references public.leasing_applications (id) on delete restrict,
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null,
  phone text not null check (char_length(phone) between 7 and 32),
  current_address text not null check (char_length(current_address) between 5 and 500),
  employer text not null check (char_length(employer) between 1 and 200),
  monthly_household_income numeric(12, 2) not null check (monthly_household_income >= 0),
  desired_move_in_date date not null,
  household_size integer not null check (household_size between 1 and 20),
  pets_count integer not null default 0 check (pets_count between 0 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_contact_details_email_idx
  on public.application_contact_details (lower(email));

create table if not exists public.application_email_verification_tokens (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  application_id uuid not null references public.leasing_applications (id) on delete restrict,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.application_submission_rate_limits (
  client_key_hash text primary key check (client_key_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

create index if not exists application_email_tokens_application_idx
  on public.application_email_verification_tokens (application_id, created_at desc);

alter table public.application_contact_details enable row level security;
alter table public.application_email_verification_tokens enable row level security;
alter table public.application_submission_rate_limits enable row level security;

revoke all on public.application_contact_details,
  public.application_email_verification_tokens,
  public.application_submission_rate_limits
  from public, anon, authenticated;

grant select, insert, update on public.application_contact_details,
  public.application_email_verification_tokens, public.application_submission_rate_limits
  to service_role;

create or replace function public.consume_application_submission_limit(
  p_client_key_hash text,
  p_limit integer default 5
)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  current_window timestamptz := date_trunc('hour', now());
  current_count integer;
begin
  if p_client_key_hash !~ '^[a-f0-9]{64}$' or p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid rate limit request.' using errcode = '22023';
  end if;

  insert into public.application_submission_rate_limits as limits (
    client_key_hash, window_started_at, request_count, updated_at
  ) values (p_client_key_hash, current_window, 1, now())
  on conflict (client_key_hash) do update set
    window_started_at = case
      when limits.window_started_at < current_window then current_window
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at < current_window then 1
      else limits.request_count + 1
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$function$;

revoke all on function public.consume_application_submission_limit(text, integer) from public, anon, authenticated;
grant execute on function public.consume_application_submission_limit(text, integer) to service_role;
  create or replace function public.claim_application_notifications(p_batch_size integer default 10)
  returns table (
    result_notification_id uuid,
    result_event_key text,
    result_template_key text,
    result_template_version text,
    result_channel text,
    result_recipient_address text,
    result_payload jsonb,
    result_attempt_count integer
  )
  language plpgsql
  security invoker
  set search_path = public, pg_temp
  as $function$
  begin
    update public.notification_outbox
      set status = 'retry', scheduled_at = now(), updated_at = now()
      where status = 'processing' and updated_at < now() - interval '15 minutes';

    return query
    with pending as (
      select notification.id
      from public.notification_outbox as notification
      where notification.channel = 'email'
        and notification.status in ('pending', 'retry')
        and notification.scheduled_at <= now()
      order by notification.scheduled_at, notification.created_at
      for update skip locked
      limit greatest(1, least(coalesce(p_batch_size, 10), 50))
    )
    update public.notification_outbox as notification
    set status = 'processing', attempt_count = notification.attempt_count + 1, updated_at = now()
    from pending
    where notification.id = pending.id
    returning notification.id, notification.event_key, notification.template_key,
      notification.template_version, notification.channel, notification.recipient_address,
      notification.payload, notification.attempt_count;
  end;
  $function$;

  revoke all on function public.claim_application_notifications(integer)
    from public, anon, authenticated;
  grant execute on function public.claim_application_notifications(integer) to service_role;

  create or replace function public.finish_application_notification(
    p_notification_id uuid,
    p_status text,
    p_provider_message_id text default null,
    p_error_code text default null,
    p_retry_at timestamptz default null
  )
  returns void
  language plpgsql
  security invoker
  set search_path = public, pg_temp
  as $function$
  declare
    attempt_value integer;
  begin
    if p_status not in ('sent', 'retry', 'failed') then
      raise exception 'Invalid notification completion status.' using errcode = '22023';
    end if;

    update public.notification_outbox
    set status = p_status,
        provider = 'google_apps_script',
        provider_message_id = p_provider_message_id,
        scheduled_at = case when p_status = 'retry' then coalesce(p_retry_at, now() + interval '5 minutes') else scheduled_at end,
        processed_at = case when p_status in ('sent', 'failed') then now() else null end,
        last_error_code = p_error_code,
        updated_at = now()
    where id = p_notification_id and status = 'processing'
    returning attempt_count into attempt_value;

    if attempt_value is null then
      raise exception 'Notification is not currently processing.' using errcode = 'P0002';
    end if;

    insert into public.notification_delivery_attempts (
      notification_id, attempt_number, status, provider_message_id, error_code
    ) values (
      p_notification_id, attempt_value, p_status, p_provider_message_id, p_error_code
    );
  end;
  $function$;

  revoke all on function public.finish_application_notification(uuid, text, text, text, timestamptz)
    from public, anon, authenticated;
  grant execute on function public.finish_application_notification(uuid, text, text, text, timestamptz)
    to service_role;

revoke all on function public.consume_application_submission_limit(text, integer)
  from public, anon, authenticated;
grant execute on function public.consume_application_submission_limit(text, integer)
  to service_role;

create or replace function public.create_public_leasing_application(
  p_property_slug text,
  p_submission_key uuid,
  p_token_hash text,
  p_token_expires_at timestamptz,
  p_terms_version text,
  p_terms_accepted boolean,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_current_address text,
  p_employer text,
  p_monthly_household_income numeric,
  p_desired_move_in_date date,
  p_household_size integer,
  p_pets_count integer
)
returns table (
  result_application_id uuid,
  result_reference_code text,
  result_property_address text,
  result_city text,
  result_first_name text,
  result_email text
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  property_row public.properties%rowtype;
  application_row public.leasing_applications%rowtype;
  participant_id uuid;
begin
  if not p_terms_accepted or nullif(btrim(p_terms_version), '') is null then
    raise exception 'Application terms acceptance is required.' using errcode = '22023';
  end if;
  if p_token_hash !~ '^[a-f0-9]{64}$' or p_token_expires_at <= now() then
    raise exception 'A valid email verification token is required.' using errcode = '22023';
  end if;

  select * into property_row
  from public.properties
  where slug = p_property_slug
    and published = true
    and status in ('available', 'coming_soon')
  for share;

  if not found then
    raise exception 'This property is not currently accepting applications.' using errcode = 'P0002';
  end if;

  select * into application_row
  from public.leasing_applications
  where submission_key = p_submission_key
  for update;

  if found then
    if application_row.status <> 'draft' then
      raise exception 'This application has already been submitted.' using errcode = '23505';
    end if;
    if application_row.property_id <> property_row.id then
      raise exception 'The submission key is already associated with another property.' using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.application_contact_details details
      where details.application_id = application_row.id
        and lower(details.email) = lower(p_email)
    ) then
      raise exception 'The submission key is already associated with another applicant.' using errcode = '23505';
    end if;
    update public.application_contact_details set
      first_name = btrim(p_first_name), last_name = btrim(p_last_name),
      email = lower(btrim(p_email)), phone = btrim(p_phone),
      current_address = btrim(p_current_address), employer = btrim(p_employer),
      monthly_household_income = p_monthly_household_income,
      desired_move_in_date = p_desired_move_in_date,
      household_size = p_household_size, pets_count = p_pets_count,
      updated_at = now()
    where application_id = application_row.id;
    update public.application_email_verification_tokens
      set consumed_at = now()
      where application_id = application_row.id and consumed_at is null;
  else
    insert into public.leasing_applications (
      property_id, primary_applicant_id, reference_code, status, submission_key
    ) values (
      property_row.id, null,
      'IH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
      'draft', p_submission_key
    ) returning * into application_row;

    insert into public.application_contact_details (
      application_id, first_name, last_name, email, phone, current_address,
      employer, monthly_household_income, desired_move_in_date, household_size, pets_count
    ) values (
      application_row.id, btrim(p_first_name), btrim(p_last_name), lower(btrim(p_email)),
      btrim(p_phone), btrim(p_current_address), btrim(p_employer),
      p_monthly_household_income, p_desired_move_in_date, p_household_size, p_pets_count
    );

    insert into public.application_participants (
      application_id, email, first_name, last_name, role, status
    ) values (
      application_row.id, lower(btrim(p_email)), btrim(p_first_name), btrim(p_last_name),
      'primary_applicant', 'started'
    ) returning id into participant_id;

    insert into public.application_consents (
      application_id, participant_id, consent_type, document_version, accepted_at
    ) values (
      application_row.id, participant_id, 'application_terms', p_terms_version, now()
    );

    insert into public.leasing_application_events (
      application_id, event_type, from_status, to_status, details
    ) values (
      application_row.id, 'application_created', null, 'draft',
      jsonb_build_object('channel', 'public_web', 'terms_version', p_terms_version)
    );
  end if;

  insert into public.application_email_verification_tokens (token_hash, application_id, expires_at)
    values (p_token_hash, application_row.id, p_token_expires_at);

  return query select application_row.id, application_row.reference_code,
    property_row.address, property_row.city, btrim(p_first_name), lower(btrim(p_email));
end;
$function$;

revoke all on function public.create_public_leasing_application(
  text, uuid, text, timestamptz, text, boolean, text, text, text, text, text,
  text, numeric, date, integer, integer
) from public, anon, authenticated;

grant execute on function public.create_public_leasing_application(
  text, uuid, text, timestamptz, text, boolean, text, text, text, text, text,
  text, numeric, date, integer, integer
) to service_role;

create or replace function public.verify_public_leasing_application(
  p_token_hash text,
  p_application_base_url text,
  p_support_email text,
  p_review_email text
)
returns table (
  result_reference_code text,
  result_property_address text,
  result_city text,
  result_first_name text,
  result_last_name text,
  result_email text,
  result_submitted_at timestamptz,
  result_application_id uuid
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  application_id_value uuid;
  application_row public.leasing_applications%rowtype;
  property_row public.properties%rowtype;
  contact_row public.application_contact_details%rowtype;
begin
  if p_application_base_url !~ '^https://'
    or nullif(btrim(p_support_email), '') is null
    or nullif(btrim(p_review_email), '') is null
     or p_review_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$' then
    raise exception 'Application notification configuration is invalid.' using errcode = '22023';
  end if;

  update public.application_email_verification_tokens
    set consumed_at = now()
    where token_hash = p_token_hash
      and consumed_at is null
      and expires_at > now()
    returning application_email_verification_tokens.application_id into application_id_value;

  if application_id_value is null then
    raise exception 'Verification link is invalid or expired.' using errcode = 'P0002';
  end if;

  update public.leasing_applications
    set status = 'submitted', email_verified_at = now(), submitted_at = now(), updated_at = now()
    where id = application_id_value and status = 'draft'
    returning * into application_row;

  if not found then
    raise exception 'Application is no longer awaiting email verification.' using errcode = 'P0002';
  end if;

  update public.application_participants
    set status = 'submitted', updated_at = now()
    where application_id = application_id_value and role = 'primary_applicant';

  insert into public.leasing_application_events (
    application_id, event_type, from_status, to_status, details
  ) values (
    application_id_value, 'application_email_verified', 'draft', 'submitted',
    jsonb_build_object('channel', 'email_verification')
  );

  select * into property_row from public.properties where id = application_row.property_id;
  select * into contact_row from public.application_contact_details where application_id = application_id_value;

  insert into public.notification_outbox (
    event_key, event_type, template_key, template_version, channel,
    recipient_address, payload
  ) values (
    'application-submitted:' || application_id_value::text,
    'application.submitted', 'application.submitted', '1', 'email',
    contact_row.email,
    jsonb_build_object(
      'firstName', contact_row.first_name,
      'propertyAddress', property_row.address || ', ' || property_row.city,
      'submittedAt', application_row.submitted_at,
      'applicationReference', application_row.reference_code,
      'portalUrl', p_application_base_url,
      'supportContact', p_support_email
    )
  );

  insert into public.notification_outbox (
    event_key, event_type, template_key, template_version, channel,
    recipient_address, payload
  ) values (
    'application-staff-submitted:' || application_id_value::text,
    'application.staff_submitted', 'application.staff_submitted', '1', 'email',
    lower(btrim(p_review_email)),
    jsonb_build_object(
      'applicantName', contact_row.first_name || ' ' || contact_row.last_name,
      'applicantEmail', contact_row.email,
      'propertyAddress', property_row.address || ', ' || property_row.city,
      'submittedAt', application_row.submitted_at,
      'applicationReference', application_row.reference_code,
      'portalUrl', p_application_base_url,
      'supportContact', lower(btrim(p_support_email))
    )
  );

  return query select application_row.reference_code, property_row.address,
    property_row.city, contact_row.first_name, contact_row.last_name,
    contact_row.email, application_row.submitted_at, application_row.id;
end;
$function$;

revoke all on function public.verify_public_leasing_application(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.verify_public_leasing_application(text, text, text, text) to service_role;

create or replace function public.claim_application_notifications(p_batch_size integer default 10)
returns table (
  result_notification_id uuid,
  result_event_key text,
  result_template_key text,
  result_template_version text,
  result_channel text,
  result_recipient_address text,
  result_payload jsonb,
  result_attempt_count integer
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
begin
  update public.notification_outbox
    set status = 'retry', scheduled_at = now(), updated_at = now()
    where status = 'processing' and updated_at < now() - interval '15 minutes';

  return query
  with pending as (
    select notification.id
    from public.notification_outbox as notification
    where notification.channel = 'email'
      and notification.status in ('pending', 'retry')
      and notification.scheduled_at <= now()
    order by notification.scheduled_at, notification.created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_batch_size, 10), 50))
  )
  update public.notification_outbox as notification
  set status = 'processing', attempt_count = notification.attempt_count + 1, updated_at = now()
  from pending
  where notification.id = pending.id
  returning notification.id, notification.event_key, notification.template_key,
    notification.template_version, notification.channel, notification.recipient_address,
    notification.payload, notification.attempt_count;
end;
$function$;

revoke all on function public.claim_application_notifications(integer)
  from public, anon, authenticated;
grant execute on function public.claim_application_notifications(integer) to service_role;

create or replace function public.finish_application_notification(
  p_notification_id uuid,
  p_status text,
  p_provider_message_id text default null,
  p_error_code text default null,
  p_retry_at timestamptz default null
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  attempt_value integer;
begin
  if p_status not in ('sent', 'retry', 'failed') then
    raise exception 'Invalid notification completion status.' using errcode = '22023';
  end if;

  update public.notification_outbox
  set status = p_status,
      provider = 'google_apps_script',
      provider_message_id = p_provider_message_id,
      scheduled_at = case when p_status = 'retry' then coalesce(p_retry_at, now() + interval '5 minutes') else scheduled_at end,
      processed_at = case when p_status in ('sent', 'failed') then now() else null end,
      last_error_code = p_error_code,
      updated_at = now()
  where id = p_notification_id and status = 'processing'
  returning attempt_count into attempt_value;

  if attempt_value is null then
    raise exception 'Notification is not currently processing.' using errcode = 'P0002';
  end if;

  insert into public.notification_delivery_attempts (
    notification_id, attempt_number, status, provider_message_id, error_code
  ) values (
    p_notification_id, attempt_value, p_status, p_provider_message_id, p_error_code
  );
end;
$function$;

revoke all on function public.finish_application_notification(uuid, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.finish_application_notification(uuid, text, text, text, timestamptz)
  to service_role;