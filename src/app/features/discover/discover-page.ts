import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { DiscoveryService, Place } from '../../core/discovery.service';

interface Group { kind: string; title: string; items: Place[]; }

@Component({
  selector: 'app-discover-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Découvrir <span class="jp-accent">見どころ</span></h1>
      <p class="subtitle">Idées puisées sur OpenStreetMap : must-see, insolites et restos par ville.</p>
    </div>

    <div class="discover-cities">
      @for (c of cities(); track c.city) {
        <button class="mood-filter-btn" [class.active]="selected() === c.city" (click)="select(c.city)">{{ c.city }}</button>
      }
    </div>

    @if (loading()) {
      <div class="loading-screen" style="min-height:200px"><div class="loading-torii">🧭</div><p class="loading-text">Recherche sur OpenStreetMap…</p></div>
    } @else if (!groups().length) {
      <div class="empty-state"><div style="font-size:2.5rem">🧭</div><p>Aucun lieu trouvé pour cette ville.</p></div>
    } @else {
      @for (group of groups(); track group.kind) {
        <section class="discover-section">
          <div class="restos-city-header">
            <span class="restos-city-name">{{ group.title }}</span>
            <span class="muted text-sm">{{ group.items.length }}</span>
          </div>
          <div class="discover-grid">
            @for (p of group.items; track p.id) {
              <article class="discover-card">
                <div class="discover-kind">{{ p.category }}</div>
                <div class="discover-name">{{ p.name }}</div>
                <div class="discover-links">
                  <a [href]="p.osmUrl" target="_blank" rel="noopener">OpenStreetMap ↗</a>
                  @if (p.wikipedia) { <a [href]="p.wikipedia" target="_blank" rel="noopener">Wikipédia ↗</a> }
                  @if (p.website) { <a [href]="p.website" target="_blank" rel="noopener">Site ↗</a> }
                </div>
              </article>
            }
          </div>
        </section>
      }
      <p class="discover-source">Données © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>.</p>
    }
  `,
  styles: [`
    :host { display: block; }
    .discover-cities { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
    .discover-section { margin-bottom: 32px; }
    .discover-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
    .discover-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 14px 16px; box-shadow: var(--shadow-sm); transition: transform .2s var(--ease), box-shadow .2s var(--ease); }
    .discover-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .discover-kind { font-size: .6rem; text-transform: uppercase; letter-spacing: .1em; color: var(--accent); font-weight: 700; }
    .discover-name { font-family: 'Shippori Mincho', serif; font-size: 1rem; margin: 3px 0 8px; }
    .discover-links { display: flex; flex-wrap: wrap; gap: 10px; font-size: .7rem; }
    .discover-links a { color: var(--ink3); }
    .discover-links a:hover { color: var(--accent); }
    .discover-source { font-size: .7rem; color: var(--ink3); margin-top: 8px; }
  `],
})
export class DiscoverPage {
  private readonly content = inject(ContentService);
  private readonly discovery = inject(DiscoveryService);

  readonly cities = computed(() => {
    const seen = new Set<string>();
    return this.content.stops()
      .map((s) => ({ city: s.city, dest: this.content.destinationByCity(s.city) }))
      .filter((c) => !!c.dest?.lat && !!c.dest?.lng && !seen.has(c.city) && !!seen.add(c.city));
  });
  readonly selected = signal<string | null>(null);
  readonly places = signal<Place[]>([]);
  readonly loading = signal(false);

  readonly groups = computed<Group[]>(() => {
    const p = this.places();
    return [
      { kind: 'must', title: 'À ne pas manquer', items: p.filter((x) => x.kind === 'must') },
      { kind: 'insolite', title: 'Insolite', items: p.filter((x) => x.kind === 'insolite') },
      { kind: 'resto', title: 'Où manger', items: p.filter((x) => x.kind === 'resto') },
    ].filter((g) => g.items.length);
  });

  constructor() {
    const first = this.cities()[0];
    if (first) this.select(first.city);
  }

  select(city: string): void {
    this.selected.set(city);
    const dest = this.content.destinationByCity(city);
    if (!dest?.lat || !dest?.lng) { this.places.set([]); return; }
    this.loading.set(true);
    this.places.set([]);
    void this.discovery.places(dest.lat, dest.lng).then((places) => {
      this.places.set(places);
      this.loading.set(false);
    });
  }
}
