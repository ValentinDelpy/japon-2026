import { Injectable, computed, signal } from '@angular/core';
import { getSupabase } from './supabase';
import { Content, Destination, EMPTY_CONTENT, Note } from './models';

/** Données brutes telles que renvoyées par les tables PostgreSQL. */
export interface RawContent {
  trips: any[]; destinations: any[]; stops: any[]; days: any[]; activities: any[];
  transportLegs: any[]; accommodations: any[]; reservations: any[]; restaurants: any[];
  souvenirs: any[]; packingCategories: any[]; packingItems: any[]; checklistPhases: any[];
  checklistTasks: any[]; phrases: any[]; culturalEvents: any[]; moodboardSections: any[];
  moodboardImages: any[]; photos: any[]; weather: any[]; logisticsSections: any[];
  logisticsItems: any[]; japan101Sections: any[]; japan101Items: any[]; surpriseItems: any[]; notes: any[];
}

const byOrder = <T extends { order_index?: number }>(list: T[]): T[] =>
  [...list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

const groupBy = <T>(list: T[], key: (x: T) => string): Record<string, T[]> =>
  list.reduce<Record<string, T[]>>((acc, x) => { (acc[key(x)] ??= []).push(x); return acc; }, {});

/**
 * Assemble les tables brutes en modèle de domaine (fonction pure, testable).
 * Les restaurants et les enfants (packing, checklist, moodboard…) sont rattachés à leur parent.
 */
export function assembleContent(raw: RawContent): Content {
  const restaurantsByDest = groupBy(raw.restaurants, (r) => r.destination_id ?? '');
  const itemsByCategory = groupBy(raw.packingItems, (i) => i.category_id);
  const tasksByPhase = groupBy(raw.checklistTasks, (t) => t.phase_id);
  const imagesBySection = groupBy(raw.moodboardImages, (i) => i.section_id);
  const logisticsBySection = groupBy(raw.logisticsItems, (i) => i.section_id);
  const japanBySection = groupBy(raw.japan101Items, (i) => i.section_id);

  const destinations: Destination[] = byOrder(raw.destinations).map((d) => ({
    ...d,
    highlights: d.highlights ?? [],
    funFacts: d.fun_facts ?? [],
    restaurants: byOrder(restaurantsByDest[d.id] ?? []),
  }));

  return {
    trip: raw.trips[0] ?? null,
    destinations,
    stops: byOrder(raw.stops),
    days: byOrder(raw.days),
    activities: byOrder(raw.activities),
    transportLegs: byOrder(raw.transportLegs),
    accommodations: byOrder(raw.accommodations),
    reservations: byOrder(raw.reservations),
    restaurants: byOrder(raw.restaurants),
    souvenirs: byOrder(raw.souvenirs),
    packingCategories: byOrder(raw.packingCategories).map((c) => ({ ...c, items: byOrder(itemsByCategory[c.id] ?? []) })),
    checklistPhases: byOrder(raw.checklistPhases).map((p) => ({ ...p, tasks: byOrder(tasksByPhase[p.id] ?? []) })),
    phrases: byOrder(raw.phrases),
    culturalEvents: byOrder(raw.culturalEvents),
    moodboardSections: byOrder(raw.moodboardSections).map((s) => ({ ...s, images: byOrder(imagesBySection[s.id] ?? []) })),
    photos: byOrder(raw.photos),
    weather: byOrder(raw.weather),
    logisticsSections: byOrder(raw.logisticsSections).map((s) => ({ ...s, items: byOrder(logisticsBySection[s.id] ?? []) })),
    japan101Sections: byOrder(raw.japan101Sections).map((s) => ({ ...s, items: byOrder(japanBySection[s.id] ?? []) })),
    surpriseItems: byOrder(raw.surpriseItems),
    notes: (raw.notes ?? []) as Note[],
  };
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _content = signal<Content>(EMPTY_CONTENT);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly content = this._content.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly trip = computed(() => this._content().trip);
  readonly stops = computed(() => [...this._content().stops].sort((a, b) => a.order_index - b.order_index));
  readonly days = computed(() => [...this._content().days].sort((a, b) => a.date.localeCompare(b.date)));
  readonly destinations = computed(() => this._content().destinations);
  readonly restaurants = computed(() => this._content().restaurants);
  readonly activities = computed(() => this._content().activities);

  accommodationForStop(stopId?: string | null) {
    return this._content().accommodations.find((a) => a.stop_id === stopId) ?? null;
  }

  destinationByCity(city?: string | null): Destination | undefined {
    if (!city) return undefined;
    const n = normalize(city);
    return this.destinations().find((d) => n.includes(normalize(d.slug)) || normalize(d.name).includes(n) || n.includes(normalize(d.name)));
  }

  noteForCity(city?: string | null): string {
    if (!city) return '';
    return this._content().notes.find((n) => n.city === city)?.body ?? '';
  }

  async load(): Promise<void> {
    const sb = getSupabase();
    this._loading.set(true);
    this._error.set(null);
    try {
      if (!sb) throw new Error('Supabase non configuré : renseignez public/config.json.');
      this._content.set(assembleContent(await this.fetchRaw(sb)));
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this._loading.set(false);
    }
  }

  update(recipe: (c: Content) => Content): void {
    this._content.update(recipe);
  }

  async persist(table: string, id: string, patch: Record<string, unknown>): Promise<void> {
    const sb = getSupabase();
    if (!sb || !id) return;
    const { error } = await sb.from(table).update(patch).eq('id', id);
    if (error) { this._error.set(error.message); await this.load(); }
  }

  async saveNote(city: string, body: string): Promise<void> {
    const sb = getSupabase();
    const tripId = this.trip()?.id;
    if (!sb || !tripId) return;
    const value = body.trim();
    this.update((c) => {
      const others = c.notes.filter((n) => n.city !== city);
      return { ...c, notes: value ? [...others, { city, body: value } satisfies Note] : others };
    });
    const error = value
      ? (await sb.from('trip_notes').upsert({ trip_id: tripId, city, body: value, updated_at: new Date().toISOString() }, { onConflict: 'trip_id,city' })).error
      : (await sb.from('trip_notes').delete().eq('trip_id', tripId).eq('city', city)).error;
    if (error) this._error.set(error.message);
  }

  /**
   * Récupère tout le contenu en un seul appel RPC.
   * Repli automatique sur des requêtes table par table si la fonction
   * `content_snapshot` n'est pas déployée (compatibilité ascendante).
   */
  private async fetchRaw(sb: NonNullable<ReturnType<typeof getSupabase>>): Promise<RawContent> {
    const { data, error } = await sb.rpc('content_snapshot');
    if (error || !data || typeof data !== 'object') return this.fetchRawByTable(sb);
    const s = data as Record<string, any[]>;
    return {
      trips: s['trips'] ?? [],
      destinations: s['destinations'] ?? [],
      stops: s['stops'] ?? [],
      days: s['days'] ?? [],
      activities: s['activities'] ?? [],
      transportLegs: s['transport_legs'] ?? [],
      accommodations: s['accommodations'] ?? [],
      reservations: s['reservations'] ?? [],
      restaurants: s['restaurants'] ?? [],
      souvenirs: s['souvenirs'] ?? [],
      packingCategories: s['packing_categories'] ?? [],
      packingItems: s['packing_items'] ?? [],
      checklistPhases: s['checklist_phases'] ?? [],
      checklistTasks: s['checklist_tasks'] ?? [],
      phrases: s['phrases'] ?? [],
      culturalEvents: s['cultural_events'] ?? [],
      moodboardSections: s['moodboard_sections'] ?? [],
      moodboardImages: s['moodboard_images'] ?? [],
      photos: s['photos'] ?? [],
      weather: s['weather_info'] ?? [],
      logisticsSections: s['logistics_sections'] ?? [],
      logisticsItems: s['logistics_items'] ?? [],
      japan101Sections: s['japan101_sections'] ?? [],
      japan101Items: s['japan101_items'] ?? [],
      surpriseItems: s['surprise_items'] ?? [],
      notes: s['trip_notes'] ?? [],
    };
  }

  private async fetchRawByTable(sb: NonNullable<ReturnType<typeof getSupabase>>): Promise<RawContent> {
    const rows = async (table: string): Promise<any[]> => {
      const { data, error } = await sb.from(table).select('*');
      if (error) throw new Error(`${table}: ${error.message}`);
      return data ?? [];
    };
    const [
      trips, destinations, stops, days, activities, transportLegs, accommodations, reservations,
      restaurants, souvenirs, packingCategories, packingItems, checklistPhases, checklistTasks,
      phrases, culturalEvents, moodboardSections, moodboardImages, photos, weather,
      logisticsSections, logisticsItems, japan101Sections, japan101Items, surpriseItems, notes,
    ] = await Promise.all([
      rows('trips'), rows('destinations'), rows('stops'), rows('days'), rows('activities'),
      rows('transport_legs'), rows('accommodations'), rows('reservations'), rows('restaurants'),
      rows('souvenirs'), rows('packing_categories'), rows('packing_items'), rows('checklist_phases'),
      rows('checklist_tasks'), rows('phrases'), rows('cultural_events'), rows('moodboard_sections'),
      rows('moodboard_images'), rows('photos'), rows('weather_info'), rows('logistics_sections'),
      rows('logistics_items'), rows('japan101_sections'), rows('japan101_items'), rows('surprise_items'),
      rows('trip_notes'),
    ]);
    return {
      trips, destinations, stops, days, activities, transportLegs, accommodations, reservations,
      restaurants, souvenirs, packingCategories, packingItems, checklistPhases, checklistTasks,
      phrases, culturalEvents, moodboardSections, moodboardImages, photos, weather,
      logisticsSections, logisticsItems, japan101Sections, japan101Items, surpriseItems, notes,
    };
  }
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}
