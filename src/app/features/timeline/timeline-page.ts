import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { formatDay } from '../../core/format';

@Component({
  selector: 'app-timeline-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Timeline <span class="jp-accent">旅の時間</span></h1><p class="subtitle">Vue chronologique, générée depuis les journées et activités.</p></div>

    <div class="timeline-page"><div class="timeline-wrapper"><div class="timeline-spine"></div>
      @for (group of months(); track group.key) {
        <div class="tl-month-divider">{{ group.label }}</div>
        @for (day of group.days; track day.date) {
          <div class="tl-day">
            <div class="tl-dot" [class.dot-current]="day.isToday" [style.background]="day.color"></div>
            <div class="tl-card">
              <div class="tl-card-head">
                <div class="tl-city">{{ day.city }} @if (day.jp) { <span class="tl-jp">{{ day.jp }}</span> }</div>
                <div class="tl-date">{{ day.label }}</div>
              </div>
              @if (day.activities.length) {
                <ul class="tl-acts-list">
                  @for (a of day.activities; track a.id) {
                    <li><span class="tl-time">{{ a.time || '—' }}</span><span>{{ a.title }}</span></li>
                  }
                </ul>
              } @else {
                <div class="tl-acts muted">Journée libre</div>
              }
            </div>
          </div>
        }
      } @empty {
        <div class="empty-state">Aucune journée.</div>
      }
    </div></div>
  `,
  styles: [`
    :host { display: block; }
    .tl-acts-list { list-style: none; display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
    .tl-acts-list li { display: flex; gap: 10px; font-size: .78rem; color: var(--ink2); }
    .tl-time { font-family: 'Space Mono', monospace; font-size: .72rem; color: var(--accent); flex-shrink: 0; min-width: 42px; }
  `],
})
export class TimelinePage {
  private readonly content = inject(ContentService);

  private static readonly COLORS = ['#4f46e5', '#e5484d', '#0f9d6e', '#c47d0a', '#0b8ac9', '#7c5cf0', '#b0576a', '#5c7d63'];
  private static readonly MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  readonly months = computed(() => {
    const acts = this.content.content().activities;
    const stops = new Map(this.content.stops().map((s) => [s.id, s]));
    const today = new Date().toISOString().slice(0, 10);
    const groups = new Map<string, { key: string; label: string; days: any[] }>();
    let i = 0;

    for (const day of this.content.days()) {
      const stop = stops.get(day.stop_id ?? '');
      const key = day.date.slice(0, 7);
      if (!groups.has(key)) {
        groups.set(key, { key, label: `${TimelinePage.MONTHS[+day.date.slice(5, 7) - 1]} ${day.date.slice(0, 4)}`, days: [] });
      }
      groups.get(key)!.days.push({
        date: day.date,
        label: formatDay(day.date),
        isToday: day.date === today,
        color: TimelinePage.COLORS[i % TimelinePage.COLORS.length],
        city: stop?.city ?? '—',
        jp: stop?.city_jp ?? this.content.destinationByCity(stop?.city)?.name_jp ?? '',
        activities: acts.filter((a) => a.day_id === day.id).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99')),
      });
      i++;
    }
    return [...groups.values()];
  });
}
