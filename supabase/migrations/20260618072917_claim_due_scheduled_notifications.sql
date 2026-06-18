alter table public.scheduled_notifications
  drop constraint if exists scheduled_notifications_status_check;

alter table public.scheduled_notifications
  add constraint scheduled_notifications_status_check
  check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled'));

create or replace function public.claim_due_scheduled_notifications(
  p_limit integer default 50
)
returns setof public.scheduled_notifications
language sql
security definer
set search_path = public
as $$
  with due as (
    select id
    from public.scheduled_notifications
    where status = 'queued'
      and scheduled_for <= now()
    order by scheduled_for asc
    limit greatest(coalesce(p_limit, 50), 0)
    for update skip locked
  ),
  claimed as (
    update public.scheduled_notifications as scheduled
    set
      status = 'processing',
      last_error = null,
      updated_at = now()
    from due
    where scheduled.id = due.id
    returning scheduled.*
  )
  select *
  from claimed
  order by scheduled_for asc;
$$;

revoke execute on function public.claim_due_scheduled_notifications(integer) from public;
revoke execute on function public.claim_due_scheduled_notifications(integer) from anon, authenticated;
grant execute on function public.claim_due_scheduled_notifications(integer) to service_role;

notify pgrst, 'reload schema';
