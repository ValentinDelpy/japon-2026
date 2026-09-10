import { Injectable, computed, signal } from '@angular/core';
import { getSupabase, supabaseConfigured } from './supabase';
import { Content, Destination, EMPTY_CONTENT } from './models';

type Source = 'supabase' | 'seed';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly _content = signal<Content>(EMPTY_CONTENT);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _source = signal<Source>(supabaseConfigured() ? 'supabase' : 'seed');

  readonly content = this._content.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly source = this._source.asReadonly();

  readonly trip = computed(() => this._content().trip);
  readonly stops = computed(() => [...this._content().stops].sort((a, b) => a.order_index - b.order_index));
  readonly days = computed(() => [...this._content().days].sort((a, b) => a.date.localeCompare(b.date)));
  readonly destinations = computed(() => this._content().destinations);
  readonly restaurants = computed(() => this._content().restaurants);
  readonly activities = computed(() => this._content().activities);

  /** Activités d'un jour donné, triées par heure puis ordre. */
  activitiesForDay(dayId?: string | null) {
    return computed(() =>
      this._content().activities
        .filter((a) => a.day_id === dayId)
        .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99') || a.order_index - b.order_index)
    );
  }

  accommodationForStop(stopId?: string | null) {
    return this._content().accommodations.find((a) => a.stop_id === stopId) ?? null;
  }

  destinationByCity(city?: string | null): Destination | undefined {
    if (!city) return undefined;
    const n = normalize(city);
    return this.destinations().find((d) => n.includes(normalize(d.slug)) || normalize(d.name).includes(n) || n.includes(normalize(d.name)));
  }

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const content = supabaseConfigured() ? await this.fromSupabase() : await this.fromSeed();
      this._content.set(content);
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this._loading.set(false);
    }
  }

  // ── Mode démo : seed.json généré par le script de migration ──
  private async fromSeed(): Promise<Content> {
    const res = await fetch('seed.json');
    if (!res.ok) throw new Error('seed.json introuvable. Lancez `node scripts/migrate-existing-data.mjs`.');
    const seed = (await res.json()) as Partial<Content>;
    const restaurants = seed.restaurants ?? [];
    const destinations = (seed.destinations ?? []).map((d) => ({
      ...d,
      highlights: d.highlights ?? [],
      funFacts: d.funFacts ?? [],
      restaurants: restaurants.filter((r) => r.destination_id === d.id),
    }));
    return { ...EMPTY_CONTENT, ...seed, destinations, restaurants } as Content;
  }

  // ── Source de vérité : PostgreSQL via Supabase ──
  private async fromSupabase(): Promise<Content> {
    const sb = getSupabase()!;
    const rows = async <T>(table: string): Promise<T[]> => {
      const { data, error } = await sb.from(table).select('*');
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []) as T[];
    };

    const [
      trips, destinations, highlights, funFacts, stops, days, activities, transportLegs,
      accommodations, reservations, restaurants, souvenirs, packingCategories, packingItems,
      checklistPhases, checklistTasks, phrases, culturalEvents, moodboardSections, moodboardImages,
      photos, weather, logisticsSections, logisticsItems, japan101Sections, japan101Items, surpriseItems,
    ] = await Promise.all([
      rows<any>('trips'), rows<any>('destinations'), rows<any>('destination_highlights'),
      rows<any>('destination_fun_facts'), rows<any>('stops'), rows<any>('days'), rows<any>('activities'),
      rows<any>('transport_legs'), rows<any>('accommodations'), rows<any>('reservations'),
      rows<any>('restaurants'), rows<any>('souvenirs'), rows<any>('packing_categories'),
      rows<any>('packing_items'), rows<any>('checklist_phases'), rows<any>('checklist_tasks'),
      rows<any>('phrases'), rows<any>('cultural_events'), rows<any>('moodboard_sections'),
      rows<any>('moodboard_images'), rows<any>('photos'), rows<any>('weather_info'),
      rows<any>('logistics_sections'), rows<any>('logistics_items'), rows<any>('japan101_sections'),
      rows<any>('japan101_items'), rows<any>('surprise_items'),
    ]);

    const by = <T extends { order_index?: number }>(list: T[]) =>
      [...list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    const group = <T>(list: T[], key: (x: T) => string) =>
      list.reduce<Record<string, T[]>>((acc, x) => { (acc[key(x)] ??= []).push(x); return acc; }, {});

    const highlightsBy = group(highlights, (h) => h.destination_id);
    const funFactsBy = group(funFacts, (f) => f.destination_id);
    const restaurantsBy = group(restaurants, (r) => r.destination_id ?? '');

    return {
      trip: trips[0] ?? null,
      destinations: by(destinations).map((d) => ({
        ...d,
        highlights: by(highlightsBy[d.id] ?? []).map((h) => h.text),
        funFacts: by(funFactsBy[d.id] ?? []).map((f) => f.text),
        restaurants: by(restaurantsBy[d.id] ?? []),
      })),
      stops: by(stops), days: by(days), activities: by(activities), transportLegs: by(transportLegs),
      accommodations: by(accommodations), reservations: by(reservations), restaurants: by(restaurants),
      souvenirs: by(souvenirs),
      packingCategories: by(packingCategories).map((c) => ({ ...c, items: by(group(packingItems, (i) => i.category_id)[c.id] ?? []) })),
      checklistPhases: by(checklistPhases).map((p) => ({ ...p, tasks: by(group(checklistTasks, (t) => t.phase_id)[p.id] ?? []) })),
      phrases: by(phrases), culturalEvents: by(culturalEvents),
      moodboardSections: by(moodboardSections).map((s) => ({ ...s, images: by(group(moodboardImages, (i) => i.section_id)[s.id] ?? []) })),
      photos: by(photos), weather: by(weather),
      logisticsSections: by(logisticsSections).map((s) => ({ ...s, items: by(group(logisticsItems, (i) => i.section_id)[s.id] ?? []) })),
      japan101Sections: by(japan101Sections).map((s) => ({ ...s, items: by(group(japan101Items, (i) => i.section_id)[s.id] ?? []) })),
      surpriseItems: by(surpriseItems),
    };
  }
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}
