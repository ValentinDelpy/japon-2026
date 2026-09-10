import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../core/content.service';
import { SearchService } from '../core/search.service';

interface Result {
  key: string;
  icon: string;
  label: string;
  sub?: string;
  kind: string;
  link?: string;
  queryParams?: Record<string, string>;
}

const PAGES: Result[] = [
  { key: 'p-dashboard', icon: '⛩️', label: 'Dashboard', kind: 'Page', link: '/dashboard' },
  { key: 'p-today', icon: '📍', label: "Aujourd'hui", kind: 'Page', link: '/today' },
  { key: 'p-itinerary', icon: '🗺️', label: 'Itinéraire', kind: 'Page', link: '/itinerary' },
  { key: 'p-timeline', icon: '📅', label: 'Timeline', kind: 'Page', link: '/timeline' },
  { key: 'p-sheets', icon: '📖', label: 'Fiches Voyage', kind: 'Page', link: '/sheets' },
  { key: 'p-stats', icon: '📊', label: 'Statistiques', kind: 'Page', link: '/statistics' },
  { key: 'p-packing', icon: '🎒', label: 'Packing List', kind: 'Page', link: '/packing' },
  { key: 'p-checklist', icon: '✅', label: 'Check-list départ', kind: 'Page', link: '/checklist' },
  { key: 'p-logistics', icon: '🚉', label: 'Logistique Japon', kind: 'Page', link: '/logistics' },
  { key: 'p-restos', icon: '🍜', label: 'Restos & Souvenirs', kind: 'Page', link: '/restaurants' },
  { key: 'p-phrases', icon: '🗣️', label: 'Phrasebook', kind: 'Page', link: '/phrasebook' },
  { key: 'p-culture', icon: '🎌', label: 'Agenda culturel', kind: 'Page', link: '/culture' },
  { key: 'p-moodboard', icon: '📸', label: 'Moodboard', kind: 'Page', link: '/moodboard' },
  { key: 'p-photos', icon: '🖼️', label: 'Photos', kind: 'Page', link: '/photos' },
  { key: 'p-weather', icon: '🌤️', label: 'Météo & Saison', kind: 'Page', link: '/weather' },
  { key: 'p-japan', icon: '🇯🇵', label: 'Japon 101', kind: 'Page', link: '/japan-101' },
  { key: 'p-surprise', icon: '🎲', label: 'Surprise !', kind: 'Page', link: '/surprise' },
  { key: 'p-print', icon: '🖨️', label: 'Impression', kind: 'Page', link: '/print' },
];

@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (search.open()) {
      <div class="cmd-overlay" (click)="search.close()">
        <div class="cmd" (click)="$event.stopPropagation()">
          <input class="cmd-input" placeholder="Rechercher une ville, une page, un plat…" [value]="query()" (input)="onInput($event)" (keydown)="onKey($event)">
          <ul class="cmd-results">
            @for (r of results(); track r.key; let i = $index) {
              <li class="cmd-item" [class.active]="i === index()" (click)="select(r)" (mouseenter)="index.set(i)">
                <span class="cmd-icon">{{ r.icon }}</span>
                <span class="cmd-body"><span class="cmd-label">{{ r.label }}</span>@if (r.sub) { <span class="cmd-sub">{{ r.sub }}</span> }</span>
                <span class="cmd-kind">{{ r.kind }}</span>
              </li>
            } @empty { <li class="cmd-empty">Aucun résultat</li> }
          </ul>
        </div>
      </div>
    }
  `,
  styles: [`
    .cmd-overlay { position: fixed; inset: 0; z-index: 4000; background: rgba(10, 9, 7, .5); backdrop-filter: blur(6px); display: flex; align-items: flex-start; justify-content: center; padding: 12vh 20px 20px; }
    .cmd { width: 100%; max-width: 560px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-lg); overflow: hidden; }
    .cmd-input { width: 100%; border: none; border-bottom: 1px solid var(--border); padding: 16px 18px; font-size: 1rem; background: transparent; color: var(--ink); outline: none; font-family: 'Outfit', sans-serif; }
    .cmd-results { list-style: none; max-height: 50vh; overflow-y: auto; }
    .cmd-item { display: flex; align-items: center; gap: 12px; padding: 11px 18px; cursor: pointer; }
    .cmd-item.active { background: var(--accent-l); }
    .cmd-icon { font-size: 1.1rem; }
    .cmd-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .cmd-label { font-weight: 600; }
    .cmd-sub { font-size: .74rem; color: var(--ink3); }
    .cmd-kind { font-size: .62rem; text-transform: uppercase; letter-spacing: .1em; color: var(--ink3); }
    .cmd-empty { padding: 20px; text-align: center; color: var(--ink3); }
  `],
})
export class CommandPalette {
  readonly search = inject(SearchService);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  readonly query = signal('');
  readonly index = signal(0);

  readonly results = computed<Result[]>(() => {
    const q = this.query().trim().toLowerCase();
    const all: Result[] = [...PAGES];
    for (const d of this.content.destinations()) {
      all.push({ key: 'd-' + d.slug, icon: '🏙️', label: d.name, sub: d.name_jp ?? undefined, kind: 'Fiche', link: '/sheets', queryParams: { city: d.name } });
    }
    for (const p of this.content.content().phrases) {
      all.push({ key: 'ph-' + (p.id ?? p.fr), icon: '🗣️', label: p.fr, sub: p.jp ?? undefined, kind: 'Phrase', link: '/phrasebook' });
    }
    for (const r of this.content.restaurants()) {
      all.push({ key: 'r-' + (r.id ?? r.name), icon: '🍜', label: r.name, sub: r.city ?? undefined, kind: 'Resto', link: '/restaurants' });
    }
    if (!q) return all.slice(0, 12);
    return all.filter((r) => (r.label + ' ' + (r.sub ?? '')).toLowerCase().includes(q)).slice(0, 20);
  });

  constructor() {
    effect(() => {
      if (this.search.open()) setTimeout(() => (document.querySelector('.cmd-input') as HTMLInputElement)?.focus(), 30);
    });
  }

  onInput(e: Event): void { this.query.set((e.target as HTMLInputElement).value); this.index.set(0); }

  onKey(e: KeyboardEvent): void {
    const list = this.results();
    if (e.key === 'Escape') { this.search.close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.index.set(Math.min(this.index() + 1, list.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.index.set(Math.max(this.index() - 1, 0)); }
    if (e.key === 'Enter' && list[this.index()]) this.select(list[this.index()]);
  }

  select(r: Result): void {
    this.search.close();
    this.query.set('');
    if (r.link) void this.router.navigate([r.link], { queryParams: r.queryParams });
  }
}
