/**
 * Charge public/seed.json dans PostgreSQL.
 * Usage : DATABASE_URL=postgresql://... node scripts/seed-db.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || process.env.DB_URL;
if (!url) { console.error('DATABASE_URL manquant.'); process.exit(1); }

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase', 'seed.json'), 'utf8'));
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function upsert(table, rows) {
  if (!rows?.length) return;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const values = [];
  const chunks = rows.map((row) => {
    const ph = cols.map((c) => {
      let v = row[c];
      if (v !== null && typeof v === 'object') v = JSON.stringify(v);
      values.push(v === undefined ? null : v);
      return `$${values.length}`;
    });
    return `(${ph.join(',')})`;
  });
  const updates = cols.filter((c) => c !== 'id').map((c) => `"${c}"=excluded."${c}"`).join(', ');
  const sql = `insert into ${table} (${cols.map((c) => `"${c}"`).join(',')}) values ${chunks.join(',')} on conflict (id) do update set ${updates}`;
  await client.query(sql, values);
  console.log(`  ✓ ${table} (${rows.length})`);
}

const withTrip = (tripId) => (r) => ({ trip_id: tripId, ...r });

await client.connect();
await client.query('begin');
try {
  const { trip, destinations, restaurants, stops, days, activities, transportLegs,
    accommodations, reservations, souvenirs, packingCategories, checklistPhases,
    phrases, culturalEvents, moodboardSections, weather, logisticsSections,
    japan101Sections, surpriseItems } = seed;
  const tripId = trip.id;
  const t = withTrip(tripId);

  await upsert('trips', [trip]);
  await upsert('destinations', destinations.map(({ highlights, funFacts, ...d }) => t(d)));
  await upsert('destination_highlights', destinations.flatMap((d) => (d.highlights ?? []).map((text, i) => ({ destination_id: d.id, text, order_index: i }))));
  await upsert('destination_fun_facts', destinations.flatMap((d) => (d.funFacts ?? []).map((text, i) => ({ destination_id: d.id, text, order_index: i }))));
  await upsert('restaurants', restaurants.map(t));
  await upsert('stops', stops.map(({ lodge, alt, price, pricePp, reserved, tickets, dur, priceTrip, nights, ...s }) => t(s)));
  await upsert('days', days.map(t));
  await upsert('activities', activities.map(t));
  await upsert('transport_legs', transportLegs.map(t));
  await upsert('accommodations', accommodations.map(t));
  await upsert('reservations', reservations.map(t));
  await upsert('souvenirs', souvenirs.map(t));
  await upsert('phrases', phrases.map(t));
  await upsert('cultural_events', culturalEvents.map(t));
  await upsert('weather_info', weather.map(t));
  await upsert('surprise_items', surpriseItems.map(t));

  await upsert('packing_categories', packingCategories.map(({ items, ...c }) => t(c)));
  await upsert('packing_items', packingCategories.flatMap((c) => c.items.map((i) => ({ ...i, category_id: c.id }))));

  await upsert('checklist_phases', checklistPhases.map(({ tasks, ...p }) => t(p)));
  await upsert('checklist_tasks', checklistPhases.flatMap((p) => p.tasks.map((x) => ({ ...x, phase_id: p.id }))));

  await upsert('moodboard_sections', moodboardSections.map(({ images, ...s }) => t(s)));
  await upsert('moodboard_images', moodboardSections.flatMap((s) => s.images.map((i) => ({ ...i, section_id: s.id }))));

  await upsert('logistics_sections', logisticsSections.map(({ items, ...s }) => t(s)));
  await upsert('logistics_items', logisticsSections.flatMap((s) => s.items.map((i) => ({ ...i, section_id: s.id }))));

  await upsert('japan101_sections', japan101Sections.map(({ items, ...s }) => t(s)));
  await upsert('japan101_items', japan101Sections.flatMap((s) => s.items.map((i) => ({ ...i, section_id: s.id }))));

  await client.query('commit');
  console.log('\n✓ Seed terminé.');
} catch (e) {
  await client.query('rollback');
  console.error('Échec seed :', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
