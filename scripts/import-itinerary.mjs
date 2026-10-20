/**
 * Importe l'itinéraire structuré (content/itinerary.json) dans Supabase.
 * Idempotent : sauvegarde isolée (schéma backup), puis reconstruit l'itinéraire.
 *
 * Usage :
 *   DATABASE_URL=postgresql://... node scripts/import-itinerary.mjs [--dry-run]
 *
 * Sécurités :
 *   - validation stricte du JSON (clés, dates, minimums) ;
 *   - verrou consultatif contre les imports concurrents ;
 *   - sauvegarde dans le schéma `backup` (inaccessible aux rôles publics) ;
 *   - préservation des liens photos → jours (par date) ;
 *   - assertions de comptage avant commit, rollback sinon.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || process.env.DB_URL;
const dryRun = process.argv.includes('--dry-run');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'itinerary.json'), 'utf8'));

// ── Validation ────────────────────────────────────────────────────
const errors = [];
for (const key of ['trip', 'stops', 'days', 'transports']) {
  if (!data[key]) errors.push(`champ manquant : ${key}`);
}
if (data.stops) {
  const keys = data.stops.map((s) => s.key);
  if (keys.length < 8) errors.push(`moins de 8 bases (${keys.length})`);
  if (new Set(keys).size !== keys.length) errors.push('clés de base dupliquées');
  const known = new Set(keys);
  const dates = (data.days ?? []).map((d) => d.date);
  if (new Set(dates).size !== dates.length) errors.push('dates de jour dupliquées');
  for (const d of data.days ?? []) {
    if (d.base && !known.has(d.base)) errors.push(`base inconnue : ${d.base} (${d.date})`);
  }
  for (const t of data.transports ?? []) {
    if (t.from && !known.has(t.from)) errors.push(`trajet : origine inconnue ${t.from}`);
    if (t.to && !known.has(t.to)) errors.push(`trajet : destination inconnue ${t.to}`);
  }
  const activityCount = (data.days ?? []).reduce((n, d) => n + (d.activities?.length ?? 0), 0);
  if ((data.days ?? []).length < 15) errors.push(`moins de 15 jours (${(data.days ?? []).length})`);
  if (activityCount < 20) errors.push(`moins de 20 activités (${activityCount})`);
}
if (errors.length) {
  console.error('✗ Validation échouée :\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

const activityTotal = data.days.reduce((n, d) => n + (d.activities?.length ?? 0), 0);
console.log(`Validation OK — ${data.stops.length} bases, ${data.days.length} jours, ${activityTotal} activités, ${data.transports.length} trajets.`);
if (dryRun) {
  console.log('Dry-run : aucune écriture effectuée.');
  process.exit(0);
}
if (!url) { console.error('DATABASE_URL manquant.'); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query('begin');
  await client.query("select pg_advisory_xact_lock(hashtext('japon2026-itinerary-import'))");

  const tripRes = await client.query('select id from trips where slug = $1', [data.trip.slug]);
  if (!tripRes.rows[0]) throw new Error(`Voyage introuvable : ${data.trip.slug}`);
  const tripId = tripRes.rows[0].id;

  // Sauvegarde isolée (une fois par table).
  await client.query('create schema if not exists backup');
  await client.query('revoke usage on schema backup from anon, authenticated');
  for (const table of ['trips', 'destinations', 'stops', 'days', 'activities', 'transport_legs', 'accommodations']) {
    const reg = await client.query(`select to_regclass('backup.${table}_v3') as t`);
    if (!reg.rows[0].t) await client.query(`create table backup.${table}_v3 as select * from ${table}`);
  }

  // Liens photos → jours, préservés par date.
  const photoLinks = await client.query(
    `select p.id, to_char(d.date, 'YYYY-MM-DD') as date
       from photos p join days d on d.id = p.day_id
      where d.trip_id = $1`,
    [tripId]
  );

  // Reconstruction (ordre compatible avec les FK).
  await client.query('delete from activities where trip_id = $1', [tripId]);
  await client.query('delete from days where trip_id = $1', [tripId]);
  await client.query('delete from transport_legs where trip_id = $1', [tripId]);
  await client.query('delete from accommodations where trip_id = $1', [tripId]);
  await client.query('delete from stops where trip_id = $1', [tripId]);

  await client.query(
    `update trips set title=$1, subtitle=$2, origin=$3, destination=$4,
       start_date=$5, end_date=$6, travelers=$7 where id=$8`,
    [data.trip.title, data.trip.subtitle, data.trip.origin, data.trip.destination,
     data.trip.start_date, data.trip.end_date, data.trip.travelers, tripId]
  );

  for (const [slug, dest] of Object.entries(data.destinations ?? {})) {
    if (dest.guide_url) await client.query('update destinations set guide_url=$1 where slug=$2', [dest.guide_url, slug]);
  }

  const stopIds = {};
  for (let i = 0; i < data.stops.length; i++) {
    const s = data.stops[i];
    const dest = await client.query('select id from destinations where slug=$1', [s.destination]);
    const r = await client.query(
      `insert into stops (trip_id, destination_id, city, city_jp, start_date, end_date, notes, order_index)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [tripId, dest.rows[0]?.id ?? null, s.city, s.city_jp ?? null, s.check_in, s.check_out, s.notes ?? null, i]
    );
    stopIds[s.key] = r.rows[0].id;

    if (s.accommodation) {
      const a = s.accommodation;
      await client.query(
        `insert into accommodations
           (trip_id, stop_id, name, alt_name, url, alt_url, check_in, check_out,
            price_total, price_per_person, reserved, notes)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [tripId, r.rows[0].id, a.name, a.alt_name ?? null, a.url ?? null, a.alt_url ?? null,
         s.check_in, s.check_out, a.price_total ?? null, a.price_per_person ?? null,
         a.reserved ?? false, a.notes ?? null]
      );
    }
  }

  const dayIdByDate = {};
  for (let i = 0; i < data.days.length; i++) {
    const d = data.days[i];
    const baseId = d.base ? stopIds[d.base] : null;
    const day = await client.query(
      `insert into days (trip_id, stop_id, date, title, notes, base_stop_id, visited_place, order_index)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [tripId, baseId, d.date, d.visited ?? null, d.notes ?? null, baseId, d.visited ?? null, i]
    );
    dayIdByDate[d.date] = day.rows[0].id;
    const acts = d.activities ?? [];
    for (let j = 0; j < acts.length; j++) {
      await client.query(
        `insert into activities (trip_id, day_id, stop_id, title, order_index)
         values ($1,$2,$3,$4,$5)`,
        [tripId, day.rows[0].id, baseId, acts[j], j]
      );
    }
  }

  for (const row of photoLinks.rows) {
    const dayId = dayIdByDate[row.date];
    if (dayId) await client.query('update photos set day_id=$1 where id=$2', [dayId, row.id]);
  }

  for (let i = 0; i < data.transports.length; i++) {
    const t = data.transports[i];
    await client.query(
      `insert into transport_legs
         (trip_id, from_stop_id, to_stop_id, mode, date, duration, price, reserved, notes, order_index)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [tripId, t.from ? stopIds[t.from] : null, t.to ? stopIds[t.to] : null,
       t.mode ?? null, t.date ?? null, t.duration ?? null, t.price ?? null,
       t.reserved ?? false, t.notes ?? null, i]
    );
  }

  // Assertions avant commit.
  const check = await client.query(
    `select
       (select count(*) from stops where trip_id=$1)::int as stops,
       (select count(*) from days where trip_id=$1)::int as days,
       (select count(*) from activities where trip_id=$1)::int as activities,
       (select coalesce(sum(nights),0) from stops where trip_id=$1)::int as nights`,
    [tripId]
  );
  const c = check.rows[0];
  if (c.stops !== data.stops.length) throw new Error(`stops ${c.stops} ≠ ${data.stops.length}`);
  if (c.days !== data.days.length) throw new Error(`jours ${c.days} ≠ ${data.days.length}`);
  if (c.activities !== activityTotal) throw new Error(`activités ${c.activities} ≠ ${activityTotal}`);

  await client.query('commit');
  console.log(`✓ Import terminé — ${c.stops} bases, ${c.nights} nuits, ${c.days} jours, ${c.activities} activités, ${data.transports.length} trajets.`);
} catch (e) {
  await client.query('rollback');
  console.error('✗ Import annulé :', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
