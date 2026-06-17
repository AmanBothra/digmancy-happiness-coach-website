alter table public.seminar_registrations
  add column if not exists city text,
  add column if not exists profession text;

alter table public.seminar_registrations
  drop constraint if exists seminar_registrations_city_required,
  add constraint seminar_registrations_city_required
    check (city is null or length(btrim(city)) > 0);

alter table public.seminar_registrations
  drop constraint if exists seminar_registrations_profession_required,
  add constraint seminar_registrations_profession_required
    check (profession is null or length(btrim(profession)) > 0);
