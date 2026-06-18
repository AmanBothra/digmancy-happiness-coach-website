create or replace function public.record_cashfree_payment_webhook_atomic(
  p_order_id text,
  p_event_type text,
  p_order_status text,
  p_payment_status text,
  p_cf_payment_id text,
  p_status text,
  p_paid_at timestamptz,
  p_raw_payload jsonb
)
returns jsonb
language plpgsql
as $$
declare
  current_registration public.seminar_registrations%rowtype;
  updated_registration public.seminar_registrations%rowtype;
begin
  select *
    into current_registration
    from public.seminar_registrations
    where order_id = p_order_id
    for update;

  insert into public.cashfree_payment_events (
    registration_id,
    order_id,
    event_type,
    order_status,
    payment_status,
    cf_payment_id,
    raw_payload
  )
  values (
    current_registration.id,
    p_order_id,
    p_event_type,
    p_order_status,
    p_payment_status,
    p_cf_payment_id,
    coalesce(p_raw_payload, '{}'::jsonb)
  );

  if current_registration.id is null then
    return jsonb_build_object(
      'registration', null,
      'duplicatePaidWebhook', false
    );
  end if;

  if current_registration.status = 'paid' then
    return jsonb_build_object(
      'registration', to_jsonb(current_registration),
      'duplicatePaidWebhook', p_status = 'paid'
    );
  end if;

  update public.seminar_registrations
    set
      status = p_status,
      cashfree_order_status = coalesce(p_order_status, current_registration.cashfree_order_status),
      cashfree_payment_status = coalesce(p_payment_status, current_registration.cashfree_payment_status),
      cf_payment_id = coalesce(p_cf_payment_id, current_registration.cf_payment_id),
      paid_at = coalesce(p_paid_at, current_registration.paid_at),
      raw_latest_webhook = coalesce(p_raw_payload, '{}'::jsonb),
      last_error = null
    where id = current_registration.id
    returning * into updated_registration;

  return jsonb_build_object(
    'registration', to_jsonb(updated_registration),
    'duplicatePaidWebhook', false
  );
end;
$$;

revoke all on function public.record_cashfree_payment_webhook_atomic(
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) from public, anon, authenticated;

grant execute on function public.record_cashfree_payment_webhook_atomic(
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  jsonb
) to service_role;

notify pgrst, 'reload schema';
