import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { CulturalEvent } from '../../core/models';

@Component({
  selector: 'app-culture-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Agenda culturel <span class="jp-accent">文化カレンダー</span></h1>
      <p class="subtitle">Événements pendant le séjour.</p>
      <a class="btn btn-secondary btn-sm" routerLink="/discover" style="margin-top:12px">🧭 Must-see & insolites par ville (OpenStreetMap) →</a>
    </div>

    <div class="agenda-filters">
      <button class="agenda-filter-btn" [class.active]="filter() === 'all'" (click)="filter.set('all')">Tout</button>
      @for (t of types(); track t) { <button class="agenda-filter-btn" [class.active]="filter() === t" (click)="filter.set(t)">{{ t }}</button> }
    </div>

    <div class="agenda-timeline">
      @for (group of groups(); track group.city) {
        <div class="agenda-city-block">
          <div class="agenda-city-header">
            <div class="agenda-city-info"><span class="agenda-city-name">{{ group.city }}</span><span class="agenda-city-jp">{{ group.jp }}</span></div>
            @if (group.dates) { <span class="agenda-city-dates">📅 {{ group.dates }}</span> }
          </div>
          <div class="agenda-events">
            @for (e of group.items; track e.id ?? e.name) {
              <div class="agenda-event">
                <div class="agenda-event-emoji">{{ e.emoji || '📌' }}</div>
                <div class="agenda-event-body">
                  <div class="agenda-event-name">{{ e.name }}</div>
                  @if (e.date) { <div class="agenda-event-date">📆 {{ e.date }}</div> }
                  <div class="agenda-event-desc">{{ e.description }}</div>
                  @if (e.tip) { <div class="agenda-event-tip">{{ e.tip }}</div> }
                </div>
                <div class="agenda-event-meta">
                  @if (e.type) { <span class="agenda-type-badge">{{ e.emoji }} {{ e.type }}</span> }
                  @if (e.price) { <span class="agenda-price">{{ e.price }}</span> }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class CulturePage {
  private readonly content = inject(ContentService);
  readonly filter = signal('all');

  readonly types = computed(() => [...new Set(this.content.content().culturalEvents.map((e) => e.type).filter((t): t is string => !!t))].sort());

  readonly groups = computed(() => {
    const f = this.filter();
    const events = this.content.content().culturalEvents.filter((e) => f === 'all' || e.type === f);
    const map = new Map<string, { city: string; jp: string; dates: string; items: CulturalEvent[] }>();
    for (const e of events) {
      const city = e.city || 'Autre';
      if (!map.has(city)) map.set(city, { city, jp: e.city_jp || '', dates: e.date_label || '', items: [] });
      map.get(city)!.items.push(e);
    }
    return [...map.values()];
  });
}
