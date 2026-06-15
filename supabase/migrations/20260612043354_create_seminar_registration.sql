create extension if not exists pgcrypto with schema extensions;

create table if not exists public.seminar_registrations (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id text not null unique,
  cf_order_id text,
  payment_session_id text,
  name text not null,
  email text not null,
  mobile text not null,
  amount numeric(10, 2) not null default 99.00,
  currency text not null default 'INR',
  status text not null default 'pending_payment'
    check (status in (
      'pending_payment',
      'paid',
      'payment_failed',
      'payment_dropped',
      'cashfree_order_failed'
    )),
  cashfree_order_status text,
  cashfree_payment_status text,
  cf_payment_id text,
  paid_at timestamptz,
  webinar_start_at timestamptz,
  webinar_date_label text,
  webinar_time_label text,
  joining_link text,
  raw_create_order_response jsonb,
  raw_latest_webhook jsonb,
  last_error text,
  reminders_scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cashfree_payment_events (
  id uuid primary key default extensions.gen_random_uuid(),
  registration_id uuid references public.seminar_registrations(id) on delete set null,
  order_id text not null,
  event_type text not null,
  order_status text,
  payment_status text,
  cf_payment_id text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  registration_id uuid references public.seminar_registrations(id) on delete set null,
  order_id text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_key text not null,
  recipient text,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.scheduled_notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  registration_id uuid not null references public.seminar_registrations(id) on delete cascade,
  order_id text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_key text not null,
  recipient text,
  scheduled_for timestamptz not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'cancelled')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_notifications_unique_message
    unique (registration_id, channel, template_key)
);

create index if not exists seminar_registrations_status_idx
  on public.seminar_registrations(status);

create index if not exists seminar_registrations_email_idx
  on public.seminar_registrations(email);

create index if not exists cashfree_payment_events_order_id_idx
  on public.cashfree_payment_events(order_id);

create index if not exists notification_logs_order_template_idx
  on public.notification_logs(order_id, channel, template_key, status);

create index if not exists scheduled_notifications_due_idx
  on public.scheduled_notifications(status, scheduled_for);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seminar_registrations_set_updated_at
  on public.seminar_registrations;
create trigger seminar_registrations_set_updated_at
before update on public.seminar_registrations
for each row execute function public.set_updated_at();

drop trigger if exists scheduled_notifications_set_updated_at
  on public.scheduled_notifications;
create trigger scheduled_notifications_set_updated_at
before update on public.scheduled_notifications
for each row execute function public.set_updated_at();

alter table public.seminar_registrations enable row level security;
alter table public.cashfree_payment_events enable row level security;
alter table public.notification_logs enable row level security;
alter table public.scheduled_notifications enable row level security;

revoke all on public.seminar_registrations from anon, authenticated;
revoke all on public.cashfree_payment_events from anon, authenticated;
revoke all on public.notification_logs from anon, authenticated;
revoke all on public.scheduled_notifications from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.seminar_registrations to service_role;
grant select, insert, update, delete on public.cashfree_payment_events to service_role;
grant select, insert, update, delete on public.notification_logs to service_role;
grant select, insert, update, delete on public.scheduled_notifications to service_role;
revoke execute on function public.set_updated_at() from public;
grant execute on function public.set_updated_at() to service_role;
