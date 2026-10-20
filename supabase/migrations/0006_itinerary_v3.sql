-- ════════════════════════════════════════════════════════════════
-- Itinéraire v3 — modèle jour-centrique + liens de contenu
-- Additif : ne casse pas l'existant (stop_id conservé pour compatibilité).
-- ════════════════════════════════════════════════════════════════

-- Un jour a une base de logement (où l'on dort) et un lieu visité (distinct).
alter table days add column if not exists base_stop_id uuid references stops(id) on delete set null;
alter table days add column if not exists visited_place text;
create unique index if not exists days_trip_date_uidx on days(trip_id, date);

-- Les activités appartiennent à un jour (et héritent de sa ville visitée).
alter table activities add column if not exists day_id uuid references days(id) on delete cascade;
create index if not exists activities_day_idx on activities(day_id);

-- Lien « derrière le texte » des guides de ville (ex. kanpai.fr).
alter table destinations add column if not exists guide_url text;

create index if not exists stops_trip_order_idx on stops(trip_id, order_index);
create index if not exists activities_trip_day_idx on activities(trip_id, day_id);
create index if not exists transport_trip_idx on transport_legs(trip_id, order_index);
create index if not exists accom_stop_idx on accommodations(stop_id);

-- Cohérence des dates de logement (validée pour les nouvelles lignes).
alter table accommodations drop constraint if exists accommodations_dates_chk;
alter table accommodations add constraint accommodations_dates_chk
  check (check_out is null or check_in is null or check_out > check_in) not valid;

-- Vue itinéraire jour par jour (RLS respectée).
create or replace view v_itinerary
with (security_invoker = true)
as
select
  d.trip_id,
  d.date,
  d.order_index,
  d.visited_place,
  b.id   as base_stop_id,
  b.city as base_city,
  coalesce(
    jsonb_agg(to_jsonb(a) order by a.order_index) filter (where a.id is not null),
    '[]'::jsonb
  ) as activities
from days d
left join stops b on b.id = d.base_stop_id
left join activities a on a.day_id = d.id
group by d.id, d.trip_id, d.date, d.order_index, d.visited_place, b.id, b.city;

grant select on v_itinerary to authenticated;
