-- ════════════════════════════════════════════════════════════════
-- Simplification : listes de destination en jsonb + notes personnelles
-- ════════════════════════════════════════════════════════════════

-- 1. Fusionner destination_highlights / destination_fun_facts en jsonb
alter table destinations add column if not exists highlights jsonb not null default '[]'::jsonb;
alter table destinations add column if not exists fun_facts jsonb not null default '[]'::jsonb;

update destinations d set highlights = coalesce(
  (select jsonb_agg(h.text order by h.order_index) from destination_highlights h where h.destination_id = d.id),
  '[]'::jsonb
);
update destinations d set fun_facts = coalesce(
  (select jsonb_agg(f.text order by f.order_index) from destination_fun_facts f where f.destination_id = d.id),
  '[]'::jsonb
);

drop table if exists destination_highlights;
drop table if exists destination_fun_facts;

-- 2. Notes personnelles (une par ville)
create table if not exists trip_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  city text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique (trip_id, city)
);

do $$ begin
  alter table trip_notes enable row level security;
  drop policy if exists trip_notes_read on trip_notes;
  create policy trip_notes_read on trip_notes for select using (true);
  drop policy if exists trip_notes_write on trip_notes;
  create policy trip_notes_write on trip_notes for all to authenticated using (is_admin()) with check (is_admin());
end $$;
