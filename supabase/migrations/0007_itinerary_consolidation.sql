-- ════════════════════════════════════════════════════════════════
-- Consolidation Phase 1 (revue architecte / recette)
-- ════════════════════════════════════════════════════════════════

-- 1. Dates de transport (indispensables pour « transport du jour »).
alter table transport_legs add column if not exists date date;
create index if not exists transport_trip_date_idx on transport_legs(trip_id, date);

-- 2. Index manquant sur la base du jour.
create index if not exists days_base_stop_idx on days(base_stop_id);

-- 3. Suppression des index dupliqués (conservés : idx_activities_day, idx_accommodations_stop).
drop index if exists activities_day_idx;
drop index if exists accom_stop_idx;

-- 4. Sauvegardes d'import isolées, inaccessibles aux rôles publics.
create schema if not exists backup;
revoke usage on schema backup from anon, authenticated;
