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
  'fifteen_minutes_before',
  case when reminder.channel = 'email' then registration.email else registration.mobile end,
  registration.webinar_start_at - interval '15 minutes',
  'queued'
from public.seminar_registrations registration
cross join (
  values ('email'), ('whatsapp')
) as reminder(channel)
where registration.status = 'paid'
  and registration.webinar_start_at is not null
  and registration.webinar_start_at > now()
on conflict (registration_id, channel, template_key) do nothing;

notify pgrst, 'reload schema';
