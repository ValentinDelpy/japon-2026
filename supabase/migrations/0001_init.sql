-- ════════════════════════════════════════════════════════════════
-- Little Domo Very Arigatō — schéma initial
-- Une seule source de vérité : le voyage + son contenu éditorial.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Admin (un seul utilisateur principal) ──────────────────────
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- ── Voyage ─────────────────────────────────────────────────────
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  origin text,
  destination text,
  start_date date,
  end_date date,
  travelers int not null default 1,
  description text,
  currency text not null default 'EUR',
  theme text not null default 'light',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Destinations (fiches voyage) ───────────────────────────────
create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  slug text not null,
  name text not null,
  name_jp text,
  image_url text,
  intro text,
  tips text,
  lat double precision,
  lng double precision,
  order_index int not null default 0,
  unique (trip_id, slug)
);

create table if not exists destination_highlights (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  text text not null,
  order_index int not null default 0
);

create table if not exists destination_fun_facts (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  text text not null,
  order_index int not null default 0
);

-- ── Étapes / journées / activités ──────────────────────────────
create table if not exists stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete set null,
  city text not null,
  city_jp text,
  start_date date,
  end_date date,
  nights int not null default 0,
  notes text,
  order_index int not null default 0
);

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  stop_id uuid references stops(id) on delete set null,
  date date not null,
  title text,
  notes text,
  order_index int not null default 0
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_id uuid references days(id) on delete cascade,
  stop_id uuid references stops(id) on delete set null,
  time text,
  title text not null,
  description text,
  category text,
  cost numeric(10,2),
  duration text,
  link text,
  lat double precision,
  lng double precision,
  order_index int not null default 0
);

-- ── Transports ─────────────────────────────────────────────────
create table if not exists transport_legs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  from_stop_id uuid references stops(id) on delete set null,
  to_stop_id uuid references stops(id) on delete set null,
  mode text,
  departure_time text,
  arrival_time text,
  duration text,
  line text,
  reference text,
  price numeric(10,2),
  reserved boolean not null default false,
  notes text,
  order_index int not null default 0
);

-- ── Hébergements ───────────────────────────────────────────────
create table if not exists accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  stop_id uuid references stops(id) on delete cascade,
  name text not null,
  alt_name text,
  url text,
  address text,
  check_in date,
  check_out date,
  price_total numeric(10,2),
  price_per_person numeric(10,2),
  reserved boolean not null default false,
  reservation_number text,
  notes text,
  lat double precision,
  lng double precision
);

-- ── Réservations (centralisées) ────────────────────────────────
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  kind text not null default 'other',   -- restaurant|hotel|transport|activity|attraction|other
  title text not null,
  reference text,
  date date,
  time text,
  price numeric(10,2),
  status text not null default 'todo',  -- todo|booked|cancelled
  url text,
  notes text,
  order_index int not null default 0
);

-- ── Restaurants ────────────────────────────────────────────────
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete set null,
  city text,
  name text not null,
  type text,
  description text,
  price text,
  tip text,
  address text,
  url text,
  lat double precision,
  lng double precision,
  favorite boolean not null default false,
  status text not null default 'idea',
  order_index int not null default 0
);

-- ── Souvenirs ──────────────────────────────────────────────────
create table if not exists souvenirs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  city text,
  name text not null,
  category text,
  description text,
  price text,
  icon text,
  shop text,
  priority text,
  bought boolean not null default false,
  notes text,
  order_index int not null default 0
);

-- ── Packing list ───────────────────────────────────────────────
create table if not exists packing_categories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  label text not null,
  icon text,
  order_index int not null default 0
);

create table if not exists packing_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references packing_categories(id) on delete cascade,
  label text not null,
  quantity text,
  required boolean not null default false,
  priority text,
  notes text,
  checked boolean not null default false,
  order_index int not null default 0
);

-- ── Check-list pré-départ ──────────────────────────────────────
create table if not exists checklist_phases (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  label text not null,
  icon text,
  color text,
  order_index int not null default 0
);

create table if not exists checklist_tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references checklist_phases(id) on delete cascade,
  label text not null,
  due_date date,
  priority text,
  status text not null default 'todo',
  link text,
  done boolean not null default false,
  order_index int not null default 0
);

-- ── Phrasebook ─────────────────────────────────────────────────
create table if not exists phrases (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  category text not null,
  category_icon text,
  fr text not null,
  jp text,
  romaji text,
  pronunciation text,
  favorite boolean not null default false,
  order_index int not null default 0
);

-- ── Agenda culturel ────────────────────────────────────────────
create table if not exists cultural_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  city text,
  city_jp text,
  date_label text,
  name text not null,
  type text,
  emoji text,
  date text,
  description text,
  tip text,
  price text,
  url text,
  image_url text,
  order_index int not null default 0
);

-- ── Moodboard ──────────────────────────────────────────────────
create table if not exists moodboard_sections (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  city text not null,
  name_jp text,
  color text,
  visible boolean not null default true,
  order_index int not null default 0
);

create table if not exists moodboard_images (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references moodboard_sections(id) on delete cascade,
  url text not null,
  alt text,
  caption text,
  visible boolean not null default true,
  order_index int not null default 0
);

-- ── Photos (fichiers dans Storage) ─────────────────────────────
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  storage_path text not null,
  title text,
  description text,
  taken_on date,
  location text,
  day_id uuid references days(id) on delete set null,
  category text,
  width int,
  height int,
  order_index int not null default 0
);

-- ── Japon 101 ──────────────────────────────────────────────────
create table if not exists japan101_sections (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  icon text,
  title text not null,
  visible boolean not null default true,
  order_index int not null default 0
);

create table if not exists japan101_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references japan101_sections(id) on delete cascade,
  question text not null,
  answer text,
  order_index int not null default 0
);

-- ── Météo & saison (contenu éditorial) ─────────────────────────
create table if not exists weather_info (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  city text not null,
  city_jp text,
  month int,
  high int,
  low int,
  rain int,
  icon text,
  koyo text,
  description text,
  tips jsonb not null default '[]'::jsonb,
  order_index int not null default 0
);

-- ── Logistique Japon ───────────────────────────────────────────
create table if not exists logistics_sections (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  icon text,
  title text not null,
  color text,
  order_index int not null default 0
);

create table if not exists logistics_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references logistics_sections(id) on delete cascade,
  text text not null,
  order_index int not null default 0
);

-- ── Surprise ───────────────────────────────────────────────────
create table if not exists surprise_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  type text not null default 'activite', -- activite|restaurant|highlight
  city text,
  text text not null,
  icon text,
  price text,
  order_index int not null default 0
);

-- ── updated_at automatique ─────────────────────────────────────
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trips_touch on trips;
create trigger trips_touch before update on trips
  for each row execute function touch_updated_at();

-- ════════════════════════════════════════════════════════════════
-- RLS : lecture publique, écriture admin uniquement
-- ════════════════════════════════════════════════════════════════
do $$
declare t text;
declare content_tables text[] := array[
  'trips','destinations','destination_highlights','destination_fun_facts',
  'stops','days','activities','transport_legs','accommodations','reservations',
  'restaurants','souvenirs','packing_categories','packing_items',
  'checklist_phases','checklist_tasks','phrases','cultural_events',
  'moodboard_sections','moodboard_images','photos','japan101_sections','japan101_items',
  'weather_info','logistics_sections','logistics_items','surprise_items'
];
begin
  foreach t in array content_tables loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists %I on %I', t || '_read', t);
    execute format('create policy %I on %I for select using (true)', t || '_read', t);
    execute format('drop policy if exists %I on %I', t || '_write', t);
    execute format('create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())', t || '_write', t);
  end loop;
end $$;

alter table admin_users enable row level security;
drop policy if exists admin_users_self on admin_users;
create policy admin_users_self on admin_users for select to authenticated using (is_admin());

-- ════════════════════════════════════════════════════════════════
-- Storage : bucket public « photos », écriture admin
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "photos_admin_write" on storage.objects;
create policy "photos_admin_write" on storage.objects
  for all to authenticated using (bucket_id = 'photos' and is_admin())
  with check (bucket_id = 'photos' and is_admin());
