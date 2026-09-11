-- ════════════════════════════════════════════════════════════════
-- Instantané complet du contenu en une seule requête JSON.
-- Remplace les 26 requêtes séparées du frontend par un unique appel,
-- ce qui réduit fortement le réseau et le temps de démarrage.
-- SECURITY INVOKER : les politiques RLS restent appliquées.
-- ════════════════════════════════════════════════════════════════

create or replace function content_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'trips',              coalesce((select jsonb_agg(to_jsonb(t)) from trips t), '[]'::jsonb),
    'destinations',       coalesce((select jsonb_agg(to_jsonb(t)) from destinations t), '[]'::jsonb),
    'stops',              coalesce((select jsonb_agg(to_jsonb(t)) from stops t), '[]'::jsonb),
    'days',               coalesce((select jsonb_agg(to_jsonb(t)) from days t), '[]'::jsonb),
    'activities',         coalesce((select jsonb_agg(to_jsonb(t)) from activities t), '[]'::jsonb),
    'transport_legs',     coalesce((select jsonb_agg(to_jsonb(t)) from transport_legs t), '[]'::jsonb),
    'accommodations',     coalesce((select jsonb_agg(to_jsonb(t)) from accommodations t), '[]'::jsonb),
    'reservations',       coalesce((select jsonb_agg(to_jsonb(t)) from reservations t), '[]'::jsonb),
    'restaurants',        coalesce((select jsonb_agg(to_jsonb(t)) from restaurants t), '[]'::jsonb),
    'souvenirs',          coalesce((select jsonb_agg(to_jsonb(t)) from souvenirs t), '[]'::jsonb),
    'packing_categories', coalesce((select jsonb_agg(to_jsonb(t)) from packing_categories t), '[]'::jsonb),
    'packing_items',      coalesce((select jsonb_agg(to_jsonb(t)) from packing_items t), '[]'::jsonb),
    'checklist_phases',   coalesce((select jsonb_agg(to_jsonb(t)) from checklist_phases t), '[]'::jsonb),
    'checklist_tasks',    coalesce((select jsonb_agg(to_jsonb(t)) from checklist_tasks t), '[]'::jsonb),
    'phrases',            coalesce((select jsonb_agg(to_jsonb(t)) from phrases t), '[]'::jsonb),
    'cultural_events',    coalesce((select jsonb_agg(to_jsonb(t)) from cultural_events t), '[]'::jsonb),
    'moodboard_sections', coalesce((select jsonb_agg(to_jsonb(t)) from moodboard_sections t), '[]'::jsonb),
    'moodboard_images',   coalesce((select jsonb_agg(to_jsonb(t)) from moodboard_images t), '[]'::jsonb),
    'photos',             coalesce((select jsonb_agg(to_jsonb(t)) from photos t), '[]'::jsonb),
    'weather_info',       coalesce((select jsonb_agg(to_jsonb(t)) from weather_info t), '[]'::jsonb),
    'logistics_sections', coalesce((select jsonb_agg(to_jsonb(t)) from logistics_sections t), '[]'::jsonb),
    'logistics_items',    coalesce((select jsonb_agg(to_jsonb(t)) from logistics_items t), '[]'::jsonb),
    'japan101_sections',  coalesce((select jsonb_agg(to_jsonb(t)) from japan101_sections t), '[]'::jsonb),
    'japan101_items',     coalesce((select jsonb_agg(to_jsonb(t)) from japan101_items t), '[]'::jsonb),
    'surprise_items',     coalesce((select jsonb_agg(to_jsonb(t)) from surprise_items t), '[]'::jsonb),
    'trip_notes',         coalesce((select jsonb_agg(to_jsonb(t)) from trip_notes t), '[]'::jsonb)
  );
$$;

grant execute on function content_snapshot() to authenticated;
