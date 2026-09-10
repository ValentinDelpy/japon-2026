-- ════════════════════════════════════════════════════════════════
-- Améliorations : lien d'hébergement, nuits calculées, index
-- ════════════════════════════════════════════════════════════════

-- Hébergement : lien alternatif (le nom principal + url forment « lien + nom »)
alter table accommodations add column if not exists alt_url text;

-- Nuits calculées automatiquement depuis les dates (colonne générée, non modifiable)
alter table stops drop column if exists nights;
alter table stops add column nights int generated always as (
  greatest(0, coalesce(end_date, start_date) - start_date)
) stored;

-- Index de jointure utiles
create index if not exists idx_activities_day on activities(day_id);
create index if not exists idx_days_stop on days(stop_id);
create index if not exists idx_accommodations_stop on accommodations(stop_id);
create index if not exists idx_transport_from on transport_legs(from_stop_id);
create index if not exists idx_transport_to on transport_legs(to_stop_id);
create index if not exists idx_highlights_dest on destination_highlights(destination_id);
create index if not exists idx_funfacts_dest on destination_fun_facts(destination_id);
