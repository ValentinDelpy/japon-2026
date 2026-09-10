import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { euro } from '../../core/format';

const CITY_COORDS: Record<string, [number, number]> = {
  toulouse: [43.60, 1.44], tokyo: [35.69, 139.69], kyoto: [35.01, 135.76], osaka: [34.69, 135.50],
  hiroshima: [34.39, 132.45], nara: [34.68, 135.83], kanazawa: [36.56, 136.66], takayama: [36.14, 137.25],
  miyajima: [34.30, 132.32], magome: [35.54, 137.55], shirakawa: [36.26, 136.89],
};

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}
const key = (name: string) => { const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); return Object.keys(CITY_COORDS).find((k) => n.includes(k)); };

@Component({
  selector: 'app-statistics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Statistiques <span class="jp-accent">旅の統計</span></h1><p class="subtitle">Chiffres calculés depuis les données du voyage.</p></div>

    <div class="stats-big-grid">
      <div class="stats-big-card"><div class="stats-big-icon">🗺️</div><div class="stats-big-value">{{ km().toLocaleString('fr-FR') }}</div><div class="stats-big-label">km parcourus</div><div class="stats-big-sub">vol d'oiseau</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🌆</div><div class="stats-big-value">{{ stats().cities }}</div><div class="stats-big-label">villes</div><div class="stats-big-sub">{{ stats().stops }} étapes</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🌙</div><div class="stats-big-value">{{ stats().nights }}</div><div class="stats-big-label">nuits</div><div class="stats-big-sub">{{ stats().days }} journées</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🎯</div><div class="stats-big-value">{{ stats().activities }}</div><div class="stats-big-label">activités</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🏠</div><div class="stats-big-value" style="color:var(--accent2)">{{ euro(stats().lodging) }}</div><div class="stats-big-label">hébergement</div><div class="stats-big-sub">{{ euro(stats().lodging / travelers()) }}/pers.</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🚄</div><div class="stats-big-value" style="color:var(--amber)">{{ euro(stats().transport) }}</div><div class="stats-big-label">transport</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">💎</div><div class="stats-big-value" style="color:var(--accent)">{{ euro(stats().lodging + stats().transport) }}</div><div class="stats-big-label">total estimé</div></div>
      <div class="stats-big-card"><div class="stats-big-icon">🍜</div><div class="stats-big-value">{{ stats().restaurants }}</div><div class="stats-big-label">restaurants</div><div class="stats-big-sub">dans les fiches</div></div>
    </div>

    <div class="stats-section-title">Répartition hébergement par ville</div>
    <div class="stats-budget-bars">
      @for (b of bars(); track b.city) {
        <div class="stats-bar-row">
          <div class="stats-bar-label">{{ b.city }}</div>
          <div class="stats-bar-track"><div class="stats-bar-fill" [style.width.%]="b.pct" [style.background]="b.color"></div></div>
          <div class="stats-bar-value">{{ euro(b.value) }}</div>
        </div>
      } @empty { <p class="muted">Aucune donnée budget.</p> }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class StatisticsPage {
  private readonly content = inject(ContentService);
  readonly euro = euro;

  readonly travelers = computed(() => this.content.trip()?.travelers || 1);

  readonly stats = computed(() => {
    const stops = this.content.stops();
    const nights = stops.reduce((s, x) => s + (x.nights || 0), 0);
    return {
      cities: new Set(stops.map((s) => s.city)).size,
      stops: stops.length,
      nights,
      days: this.content.days().length,
      activities: this.content.activities().length,
      lodging: this.content.content().accommodations.reduce((s, a) => s + (a.price_total ?? 0), 0),
      transport: this.content.content().transportLegs.reduce((s, l) => s + (l.price ?? 0), 0),
      restaurants: this.content.restaurants().length,
    };
  });

  readonly km = computed(() => {
    const cities = this.content.stops().map((s) => s.city);
    let total = 0;
    let prev: string | undefined = 'toulouse';
    for (const c of cities) {
      const k = key(c);
      if (k && CITY_COORDS[k] && prev && CITY_COORDS[prev]) { total += haversine(CITY_COORDS[prev], CITY_COORDS[k]); prev = k; }
    }
    if (prev && CITY_COORDS[prev] && CITY_COORDS['tokyo']) total += haversine(CITY_COORDS[prev], CITY_COORDS['tokyo']);
    return total;
  });

  readonly bars = computed(() => {
    const by = new Map<string, number>();
    const stops = this.content.stops();
    for (const a of this.content.content().accommodations) {
      const stop = stops.find((s) => s.id === a.stop_id);
      if (stop) by.set(stop.city, (by.get(stop.city) ?? 0) + (a.price_total ?? 0));
    }
    const max = Math.max(1, ...[...by.values()]);
    const colors = ['#4f46e5', '#e5484d', '#0f9d6e', '#c47d0a', '#0b8ac9', '#7c5cf0'];
    return [...by.entries()].sort((a, b) => b[1] - a[1]).map(([city, value], i) => ({ city, value, pct: Math.round((value / max) * 100), color: colors[i % colors.length] }));
  });
}
