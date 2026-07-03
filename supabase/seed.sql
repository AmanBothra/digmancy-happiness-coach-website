insert into public.seminar_registrations (
  order_id,
  cf_order_id,
  payment_session_id,
  name,
  email,
  mobile,
  amount,
  currency,
  status,
  cashfree_order_status,
  cashfree_payment_status,
  cf_payment_id,
  paid_at,
  webinar_start_at,
  webinar_date_label,
  webinar_time_label,
  joining_link,
  raw_create_order_response,
  raw_latest_webhook,
  reminders_scheduled_at
)
values (
  'seed_order_demo_001',
  'cf_seed_order_demo_001',
  'ps_seed_order_demo_001',
  'Demo Registration',
  'demo@example.com',
  '919999999999',
  99.00,
  'INR',
  'paid',
  'PAID',
  'SUCCESS',
  'pay_seed_demo_001',
  now(),
  '2026-06-28T05:30:00.000Z',
  'Sunday 28 June',
  '11:00 AM IST',
  'Joining link will be shared soon.',
  '{"seed": true, "source": "supabase/seed.sql"}'::jsonb,
  '{"seed": true, "type": "PAYMENT_SUCCESS_WEBHOOK"}'::jsonb,
  now()
)
on conflict (order_id) do update set
  status = excluded.status,
  cashfree_order_status = excluded.cashfree_order_status,
  cashfree_payment_status = excluded.cashfree_payment_status,
  cf_payment_id = excluded.cf_payment_id,
  paid_at = excluded.paid_at,
  raw_create_order_response = excluded.raw_create_order_response,
  raw_latest_webhook = excluded.raw_latest_webhook,
  reminders_scheduled_at = excluded.reminders_scheduled_at;

insert into public.cashfree_payment_events (
  registration_id,
  order_id,
  event_type,
  order_status,
  payment_status,
  cf_payment_id,
  raw_payload
)
select
  id,
  order_id,
  'PAYMENT_SUCCESS_WEBHOOK',
  'PAID',
  'SUCCESS',
  'pay_seed_demo_001',
  '{"seed": true, "type": "PAYMENT_SUCCESS_WEBHOOK"}'::jsonb
from public.seminar_registrations
where order_id = 'seed_order_demo_001';

insert into public.notification_logs (
  registration_id,
  order_id,
  channel,
  template_key,
  recipient,
  status,
  provider_message_id,
  sent_at
)
select
  id,
  order_id,
  'email',
  'payment_confirmation',
  email,
  'sent',
  'seed_email_message_001',
  now()
from public.seminar_registrations
where order_id = 'seed_order_demo_001';

insert into public.scheduled_notifications (
  registration_id,
  order_id,
  channel,
  template_key,
  recipient,
  scheduled_for,
  status
)
select
  registration.id,
  registration.order_id,
  reminder.channel,
  reminder.template_key,
  case when reminder.channel = 'email' then registration.email else registration.mobile end,
  reminder.scheduled_for,
  'queued'
from public.seminar_registrations registration
cross join (
  values
    ('email', 'two_days_before', '2026-06-26T05:30:00.000Z'::timestamptz),
    ('whatsapp', 'two_days_before', '2026-06-26T05:30:00.000Z'::timestamptz),
    ('email', 'one_day_before', '2026-06-27T04:30:00.000Z'::timestamptz),
    ('whatsapp', 'one_day_before', '2026-06-27T04:30:00.000Z'::timestamptz),
    ('email', 'one_hour_before', '2026-06-28T04:30:00.000Z'::timestamptz),
    ('whatsapp', 'one_hour_before', '2026-06-28T04:30:00.000Z'::timestamptz),
    ('email', 'fifteen_minutes_before', '2026-06-28T05:15:00.000Z'::timestamptz),
    ('whatsapp', 'fifteen_minutes_before', '2026-06-28T05:15:00.000Z'::timestamptz)
) as reminder(channel, template_key, scheduled_for)
where registration.order_id = 'seed_order_demo_001'
on conflict (registration_id, channel, template_key) do update set
  recipient = excluded.recipient,
  scheduled_for = excluded.scheduled_for,
  status = excluded.status,
  last_error = null;
