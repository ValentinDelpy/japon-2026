import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';

@Component({
  selector: 'app-restaurants-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Restos & Souvenirs <span class="jp-accent">食と買い物</span></h1><p class="subtitle">Adresses et idées cadeaux par ville.</p></div>

    <div class="tabs-bar">
      <button class="tab-btn" [class.active]="tab() === 'restos'" (click)="tab.set('restos')">🍽️ Restaurants</button>
      <button class="tab-btn" [class.active]="tab() === 'souvenirs'" (click)="tab.set('souvenirs')">🛍️ Souvenirs</button>
    </div>

    @if (tab() === 'restos') {
      <div class="resto-filters">
        <button class="resto-filter-btn" [class.active]="filter() === 'all'" (click)="filter.set('all')">Tout</button>
        @for (t of types(); track t) { <button class="resto-filter-btn" [class.active]="filter() === t" (click)="filter.set(t)">{{ t }}</button> }
      </div>
      @for (group of restoGroups(); track group.city) {
        <div class="restos-city-section">
          <div class="restos-city-header"><span class="restos-city-name">{{ group.city }}</span></div>
          <div class="restos-grid">
            @for (r of group.items; track r.id ?? r.name) {
              <div class="resto-card">
                <div class="resto-card-top">@if (r.type) { <span class="resto-type-badge" style="background:var(--accent-l);color:var(--accent)">{{ r.type }}</span> }</div>
                <div class="resto-name">{{ r.name }}</div>
                <div class="resto-desc">{{ r.description }}</div>
                @if (r.price) { <div class="resto-footer"><div class="resto-price">💴 {{ r.price }}</div></div> }
              </div>
            }
          </div>
        </div>
      }
    } @else {
      @for (group of souvenirGroups(); track group.city) {
        <div class="souvenirs-city-section">
          <div class="restos-city-header"><span class="restos-city-name">{{ group.city }}</span></div>
          <div class="souvenirs-grid">
            @for (s of group.items; track s.id ?? s.name) {
              <div class="souvenir-card" [class.souvenir-checked]="checkedFor(s.id)" (click)="toggleSouvenir(s.id)">
                <div class="souvenir-check">{{ checkedFor(s.id) ? '✅' : '☐' }}</div>
                <div class="souvenir-icon">{{ s.icon || '🎁' }}</div>
                <div class="souvenir-body">
                  <div class="souvenir-name">{{ s.name }}</div>
                  @if (s.category) { <div class="souvenir-cat">{{ s.category }}</div> }
                  <div class="souvenir-desc">{{ s.description }}</div>
                  @if (s.price) { <div class="souvenir-price">💴 {{ s.price }}</div> }
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: [':host { display: block; }'],
})
export class RestaurantsPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressStore);

  readonly tab = signal<'restos' | 'souvenirs'>('restos');
  readonly filter = signal('all');
  private readonly souvenirState = this.progress.state('souvenirs');

  readonly types = computed(() => [...new Set(this.content.restaurants().map((r) => r.type).filter((t): t is string => !!t))].sort());

  readonly restoGroups = computed(() => {
    const f = this.filter();
    const list = this.content.restaurants().filter((r) => f === 'all' || r.type === f);
    return groupBy(list, (r) => r.city || 'Autre');
  });

  readonly souvenirGroups = computed(() => groupBy(this.content.content().souvenirs, (s) => s.city || 'Autre'));

  checkedFor(id?: string): boolean { return !!(id && this.souvenirState()[id]); }
  toggleSouvenir(id?: string): void { if (id) this.progress.toggle('souvenirs', id); }
}

function groupBy<T>(list: T[], keyFn: (x: T) => string): { city: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const x of list) { const k = keyFn(x); (map.get(k) ?? map.set(k, []).get(k)!).push(x); }
  return [...map.entries()].map(([city, items]) => ({ city, items }));
}
