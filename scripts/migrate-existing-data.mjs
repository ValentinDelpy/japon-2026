/**
 * Migration du contenu existant (site vanilla) vers public/seed.json.
 * Produit un dump relationnel (ids + clés étrangères) identique au schéma PostgreSQL.
 *
 * Sources : Google Sheet public + js/destinations.js + js/pages-new.js
 * Usage   : node scripts/migrate-existing-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';
const GID = '2038497907';

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const uid = () => randomUUID();
const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function evalBrowserScript(code, exportsExpr) {
  const sandbox = { console, window: {}, document: {}, localStorage: {}, sessionStorage: {}, fetch: () => Promise.reject() };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(`${code}\n;__out = (${exportsExpr});`, context);
  return sandbox.__out;
}

function parseDate(str) {
  if (!str) return null;
  str = String(str).trim();
  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dm = str.match(/^Date\((\d+),(\d+),(\d+)\)$/);
  if (dm) return `${dm[1]}-${String(+dm[2] + 1).padStart(2, '0')}-${dm[3].padStart(2, '0')}`;
  return null;
}
const num = (v) => {
  if (v == null || v === '') return null;
  const n = parseFloat(String(v).replace(/[^0-9.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const isYes = (v) => /oui|true|yes/i.test(String(v || ''));

async function fetchSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;
  const text = await (await fetch(url)).text();
  const json = JSON.parse(text.match(/\{.*\}/s)[0]);
  const cols = json.table.cols.map((c) => (c.label || '').trim());
  const rows = (json.table.rows || []).map((row) => {
    const obj = {};
    (row.c || []).forEach((cell, i) => {
      if (i >= cols.length) return;
      let val = '';
      if (cell && cell.v != null) {
        const dm = String(cell.v).match(/^Date\((\d+),(\d+),(\d+)\)$/);
        val = dm ? `${String(+dm[2] + 1).padStart(2, '0')}/${dm[3]}/${dm[1]}` : cell.f != null ? String(cell.f) : String(cell.v);
      }
      obj[cols[i]] = val;
    });
    return obj;
  });
  return { cols, rows };
}

const COORDS = {
  tokyo: [35.6762, 139.6503], kyoto: [35.0116, 135.7681], osaka: [34.6937, 135.5023],
  hiroshima: [34.3853, 132.4553], nara: [34.6851, 135.8048], hakone: [35.2326, 139.1070],
  nikko: [36.7199, 139.6982], kamakura: [35.3192, 139.5467], kanazawa: [36.5613, 136.6562],
  takayama: [36.1461, 137.2522], fuji: [35.3606, 138.7274], miyajima: [34.2960, 132.3198],
  koyasan: [34.2131, 135.5833], shirakawa: [36.2574, 136.9060], magome: [35.5314, 137.5600],
};

// ── Destinations ───────────────────────────────────────────────
function buildDestinations() {
  const { DESTINATIONS_DB } = evalBrowserScript(read('js/destinations.js'), '({ DESTINATIONS_DB })');
  const destinations = [], restaurants = [];
  for (const [key, d] of Object.entries(DESTINATIONS_DB)) {
    if (key === '_default') continue;
    const id = uid();
    const c = COORDS[key];
    destinations.push({
      id, slug: key, name: d.name || key, name_jp: d.nameJP || null,
      image_url: d.image || null, intro: d.intro || null, tips: d.tips || null,
      lat: c ? c[0] : null, lng: c ? c[1] : null, order_index: destinations.length,
      highlights: d.highlights || [], funFacts: d.funFacts || [],
    });
    (d.restaurants || []).forEach((r, i) => restaurants.push({
      id: uid(), destination_id: id, city: d.name || key, name: r.name, type: r.type || null,
      description: r.desc || null, price: r.price || null, tip: r.tip || null, order_index: i,
    }));
  }
  return { destinations, restaurants };
}

// ── Itinéraire (Sheet) ─────────────────────────────────────────
function buildItinerary({ cols, rows }, destinations) {
  const find = (...kws) => {
    for (const kw of kws) { const c = cols.find((c) => c.toLowerCase() === kw.toLowerCase()); if (c) return c; }
    for (const kw of kws) { const c = cols.find((c) => c.toLowerCase().includes(kw.toLowerCase())); if (c) return c; }
    return null;
  };
  const C = {
    date: find('Jour', 'Date'), city: find('Lieu visité', 'Lieu'), lodge: find('Logement'),
    alt: find('Alternative'), price: find('Prix'), pricePp: find('Prix / personne'),
    reserved: find('Réservé'), act: find('Activités'), dur: find('Durée trajet'),
    priceTrip: find('Prix trajet'), tickets: find('Billets'), info: find('Infos'),
  };
  const destId = (city) => destinations.find((d) => slug(d.name).includes(slug(city)) || slug(city).includes(slug(d.name)) || slug(city).includes(d.slug))?.id ?? null;

  const stops = [], days = [], activities = [], transportLegs = [], accommodations = [], reservations = [];
  let current = null, prevStopId = null, dayOrder = 0, actOrder = 0;

  for (const row of rows) {
    const date = parseDate(row[C.date]);
    if (!date) continue;
    const city = (row[C.city] || '').trim();

    if (city && (!current || current.city !== city)) {
      current = {
        id: uid(), destination_id: destId(city), city, city_jp: null,
        start_date: date, end_date: date, nights: 0,
        notes: (row[C.info] || '').trim() || null, order_index: stops.length,
        lodge: (row[C.lodge] || '').trim(), alt: (row[C.alt] || '').trim(),
        price: num(row[C.price]), pricePp: num(row[C.pricePp]),
        reserved: isYes(row[C.reserved]), tickets: isYes(row[C.tickets]),
        dur: (row[C.dur] || '').trim(), priceTrip: num(row[C.priceTrip]),
      };
      stops.push(current);
      if (prevStopId) transportLegs.push({ id: uid(), from_stop_id: prevStopId, to_stop_id: current.id, mode: 'train', duration: current.dur || null, price: current.priceTrip, reserved: current.reserved, order_index: transportLegs.length });
      prevStopId = current.id;
    } else if (current) {
      current.end_date = date; current.nights++;
      if (!current.lodge && (row[C.lodge] || '').trim()) current.lodge = row[C.lodge].trim();
      if (!current.alt && (row[C.alt] || '').trim()) current.alt = row[C.alt].trim();
      if (current.price == null) current.price = num(row[C.price]);
      if (current.pricePp == null) current.pricePp = num(row[C.pricePp]);
    }
    if (!current) continue;

    const dayId = uid();
    days.push({ id: dayId, stop_id: current.id, date, title: null, notes: (row[C.info] || '').trim() || null, order_index: dayOrder++ });

    const acts = (row[C.act] || '').split(/[,\n·]/).map((a) => a.trim()).filter(Boolean);
    for (const title of acts) activities.push({ id: uid(), day_id: dayId, stop_id: current.id, title, order_index: actOrder++ });
  }

  for (const s of stops) {
    if (s.lodge) accommodations.push({
      id: uid(), stop_id: s.id, name: s.lodge, alt_name: s.alt || null,
      price_total: s.price, price_per_person: s.pricePp, reserved: s.reserved,
      check_in: s.start_date, check_out: s.end_date,
    });
    if (s.reserved || s.tickets) reservations.push({
      id: uid(), kind: 'hotel', title: `Séjour ${s.city}`,
      status: s.reserved ? 'booked' : 'todo', notes: s.tickets ? 'Billets réservés' : null, order_index: reservations.length,
    });
  }

  return { stops, days, activities, transportLegs, accommodations, reservations };
}

// ── Contenu éditorial (pages-new.js) ───────────────────────────
function buildEditorial() {
  const data = evalBrowserScript(
    read('js/pages-new.js'),
    '({ SOUVENIRS_DATA, PACKING_CATEGORIES, CHECKLIST_DATA, PHRASES, JAPON101_DATA, AGENDA_DATA, MOODBOARD_DATA, METEO_DATA })'
  );

  const souvenirs = [];
  for (const [key, city] of Object.entries(data.SOUVENIRS_DATA || {})) {
    for (const it of city.items || []) souvenirs.push({ id: uid(), city: key, name: it.name, category: it.cat || null, description: it.desc || null, price: it.price || null, icon: it.icon || null, order_index: souvenirs.length });
  }

  const packingCategories = (data.PACKING_CATEGORIES || []).map((c, i) => ({
    id: uid(), label: c.label, icon: c.icon || null, order_index: i,
    items: (c.items || []).map((it, j) => ({ id: uid(), label: it.label, required: !!it.required, order_index: j })),
  }));

  const checklistPhases = (data.CHECKLIST_DATA || []).map((p, i) => ({
    id: uid(), label: p.phase, icon: p.icon || null, color: p.color || null, order_index: i,
    tasks: (p.tasks || []).map((t, j) => ({ id: uid(), label: t.label, link: t.link || null, priority: t.important ? 'high' : null, order_index: j })),
  }));

  const phrases = [];
  (data.PHRASES || []).forEach((cat) => {
    for (const p of cat.phrases || []) phrases.push({ id: uid(), category: cat.cat, category_icon: cat.icon || null, fr: p.fr, jp: p.jp || null, romaji: p.rom || null, pronunciation: p.pron || null, order_index: phrases.length });
  });

  const japan101Sections = (data.JAPON101_DATA || []).map((s, i) => ({
    id: uid(), icon: s.icon || null, title: s.title, order_index: i,
    items: (s.items || []).map((it, j) => ({ id: uid(), question: it.q, answer: it.a || null, order_index: j })),
  }));

  const culturalEvents = [];
  (data.AGENDA_DATA || []).forEach((c) => {
    for (const e of c.events || []) culturalEvents.push({
      id: uid(), city: c.city, city_jp: c.nameJP || null, date_label: c.dates || null,
      name: e.name, type: e.type || null, emoji: e.emoji || null, date: e.date || null,
      description: e.desc || null, tip: e.tip || null, price: e.price || null, order_index: culturalEvents.length,
    });
  });

  const moodboardSections = (data.MOODBOARD_DATA || []).map((s, i) => ({
    id: uid(), city: s.city, name_jp: s.nameJP || null, color: s.color || null, order_index: i,
    images: (s.images || []).map((img, j) => ({ id: uid(), url: img.url, alt: img.alt || null, caption: img.caption || null, order_index: j })),
  }));

  const weather = (data.METEO_DATA || []).map((m, i) => ({
    id: uid(), city: m.city, city_jp: m.nameJP || null, icon: m.icon || null,
    high: m.temps?.max ?? null, low: m.temps?.min ?? null, rain: m.temps?.rain ?? null,
    koyo: m.koyo || null, description: null, tips: m.tips || [], order_index: i,
  }));

  return { souvenirs, packingCategories, checklistPhases, phrases, japan101Sections, culturalEvents, moodboardSections, weather };
}

const LOGISTICS = [
  { icon: '🚄', title: 'JR Pass — À calculer !', color: '#c73e1d', items: [
    "⚠️ Pour votre itinéraire, le JR Pass 21 jours (~616€/pers) coûte ~157€ DE PLUS que les billets à l'unité (~459€/pers estimés).",
    'Recommandation : achetez les tickets séparément, en gare ou via Eki-net.',
    'Le prix du JR Pass a fortement augmenté en octobre 2023 (+65%).',
  ]},
  { icon: '🚇', title: 'Suica / Pasmo', color: '#5c8f7d', items: [
    'Carte à puce rechargeable utilisable dans tous les métros, trains locaux, buses et konbini.',
    'Chargeable aux automates IC Card. Minimum ¥500, maximum ¥20,000.',
    "Récupérez votre carte Suica à l'aéroport dès l'arrivée.",
  ]},
  { icon: '💴', title: 'Argent & ATMs', color: '#a87d3a', items: [
    'Le Japon reste très cash-friendly : prévoyez 30 000–50 000 ¥ en espèces.',
    'ATM 7-Bank (dans tous les 7-Eleven) = la référence pour les cartes étrangères.',
    'La plupart des ATMs de banques locales refusent les cartes étrangères.',
  ]},
  { icon: '📱', title: 'Connectivité', color: '#7a9bb5', items: [
    'SIM japonaise, Pocket WiFi ou eSIM : commandez avant le départ.',
    'Google Maps fonctionne bien offline (téléchargez les zones avant).',
  ]},
  { icon: '🧳', title: 'Bagages & Shinkansen', color: '#b06080', items: [
    'Les bagages volumineux nécessitent une réservation de siège dans le Shinkansen.',
    'Service Takkyubin : envoyez vos valises de ville en ville pour ~¥1,500.',
  ]},
  { icon: '🏥', title: 'Santé & Urgences', color: '#c06070', items: [
    "Numéros d'urgence : 110 (police), 119 (SAMU/pompiers).",
    'Ambassade de France à Tokyo : +81-3-5798-6000.',
    'Assurance voyage indispensable.',
  ]},
  { icon: '🎌', title: 'Étiquette & Customs', color: '#606c38', items: [
    'Pas de pourboire — jamais.',
    'Retirez vos chaussures dans les maisons, temples et certains ryokan.',
    'Les escalators : restez à gauche à Osaka, à droite ailleurs.',
  ]},
];

function buildSurprise(destinations, restaurants) {
  const items = [];
  for (const d of destinations) {
    for (const h of d.highlights || []) items.push({ type: 'highlight', city: d.name, text: h, icon: '⭐' });
    for (const f of d.funFacts || []) items.push({ type: 'highlight', city: d.name, text: f, icon: '💡' });
  }
  for (const r of restaurants) items.push({ type: 'restaurant', city: r.city, text: `${r.name} — ${r.description || ''}`, icon: '🍜', price: r.price });
  return items.map((it, i) => ({ id: uid(), ...it, order_index: i }));
}

async function main() {
  console.log('→ Google Sheet…');
  const sheet = await fetchSheet();

  console.log('→ destinations.js…');
  const { destinations, restaurants } = buildDestinations();

  const iti = buildItinerary(sheet, destinations);

  console.log('→ pages-new.js…');
  const editorial = buildEditorial();

  const seed = {
    trip: {
      id: uid(), slug: 'japon-2026', title: 'Little Domo Very Arigatō',
      subtitle: 'Toulouse → Tokyo · Nov — Déc 2026', origin: 'Toulouse', destination: 'Tokyo',
      start_date: '2026-11-18', end_date: '2026-12-05', travelers: 4,
      description: 'Voyage au Japon en famille — itinéraire, préparatifs et carnet de route.',
      currency: 'EUR', theme: 'light', is_active: true,
    },
    destinations, restaurants,
    ...iti,
    ...editorial,
    logisticsSections: LOGISTICS.map((s, i) => ({
      id: uid(), icon: s.icon, title: s.title, color: s.color, order_index: i,
      items: s.items.map((t, j) => ({ id: uid(), text: t, order_index: j })),
    })),
    surpriseItems: buildSurprise(destinations, restaurants),
  };

  fs.writeFileSync(path.join(ROOT, 'public', 'seed.json'), JSON.stringify(seed, null, 2));
  const n = (a) => (Array.isArray(a) ? a.length : 0);
  console.log(`✓ seed.json : ${n(seed.destinations)} destinations, ${n(seed.restaurants)} restos, ${n(seed.stops)} étapes, ${n(seed.days)} jours, ${n(seed.activities)} activités, ${n(seed.phrases)} phrases, ${n(seed.surpriseItems)} surprises.`);
}

main().catch((e) => { console.error('Échec migration :', e); process.exit(1); });
