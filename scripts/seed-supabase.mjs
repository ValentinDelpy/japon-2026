/**
 * Envoie public/seed.json vers Supabase (PostgreSQL).
 *
 * PrÃ©requis :
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/seed-supabase.mjs
 *
 * âš ï¸ La clÃ© service_role est secrÃ¨te : ne jamais la committer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Renseignez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase', 'seed.json'), 'utf8'));

async function insert(table, rows) {
  if (!rows?.length) return;
  const { error } = await db.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`âœ“ ${table} (${rows.length})`);
}

async function main() {
  const { trip, destinations, restaurants, stops, days, activities, transportLegs,
    accommodations, reservations, souvenirs, packingCategories, checklistPhases,
    phrases, culturalEvents, moodboardSections, weather, logisticsSections,
    japan101Sections, surpriseItems } = seed;

  const tripId = trip.id;
  const withTrip = (r) => ({ trip_id: tripId, ...r });

  await insert('trips', [trip]);
  await insert('destinations', destinations.map(({ highlights, funFacts, ...d }) => withTrip(d)));
  await insert('destination_highlights', destinations.flatMap((d) => (d.highlights ?? []).map((text, i) => ({ destination_id: d.id, text, order_index: i }))));
  await insert('destination_fun_facts', destinations.flatMap((d) => (d.funFacts ?? []).map((text, i) => ({ destination_id: d.id, text, order_index: i }))));
  await insert('restaurants', restaurants.map(withTrip));
  await insert('stops', stops.map(({ lodge, alt, price, pricePp, reserved, tickets, dur, priceTrip, nights, ...s }) => withTrip(s)));
  await insert('days', days.map(withTrip));
  await insert('activities', activities.map(withTrip));
  await insert('transport_legs', transportLegs.map(withTrip));
  await insert('accommodations', accommodations.map(withTrip));
  await insert('reservations', reservations.map(withTrip));
  await insert('souvenirs', souvenirs.map(withTrip));
  await insert('phrases', phrases.map(withTrip));
  await insert('cultural_events', culturalEvents.map(withTrip));
  await insert('weather_info', weather.map(withTrip));
  await insert('surprise_items', surpriseItems.map(withTrip));

  await insert('packing_categories', packingCategories.map(withTrip));
  await insert('packing_items', packingCategories.flatMap((c) => c.items.map((i) => ({ ...i, category_id: c.id }))));

  await insert('checklist_phases', checklistPhases.map(withTrip));
  await insert('checklist_tasks', checklistPhases.flatMap((p) => p.tasks.map((t) => ({ ...t, phase_id: p.id }))));

  await insert('moodboard_sections', moodboardSections.map(withTrip));
  await insert('moodboard_images', moodboardSections.flatMap((s) => s.images.map((i) => ({ ...i, section_id: s.id }))));

  await insert('logistics_sections', logisticsSections.map(withTrip));
  await insert('logistics_items', logisticsSections.flatMap((s) => s.items.map((i) => ({ ...i, section_id: s.id }))));

  await insert('japan101_sections', japan101Sections.map(withTrip));
  await insert('japan101_items', japan101Sections.flatMap((s) => s.items.map((i) => ({ ...i, section_id: s.id }))));

  console.log('\nâœ… Seed terminÃ©. CrÃ©ez ensuite votre utilisateur admin et ajoutez son uid :');
  console.log("   insert into admin_users (user_id) values ('<votre-uid>');");
}

main().catch((e) => { console.error('Ã‰chec seed :', e.message); process.exit(1); });
