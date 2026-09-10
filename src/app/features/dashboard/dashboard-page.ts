import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { euro, formatRange, nightsLabel } from '../../core/format';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (trip(); as t) {
      <div class="dash-hero">
        <div class="dash-hero-main">
          <span class="dash-hero-eyebrow">{{ t.subtitle }}</span>
          <h1>{{ t.origin }} <span class="dash-hero-arrow">→</span> {{ t.destination }}</h1>
          <p class="dash-hero-dates">{{ formatRange(t.start_date, t.end_date) }} · {{ stops().length }} étapes · {{ t.travelers }} personnes</p>
        </div>
        <div class="dash-hero-side">
          <div class="dash-hero-count">{{ countdownText() }}</div>
          <div class="dash-hero-count-label">{{ countdownLabel() }}</div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Étapes</div><div class="stat-value indigo">{{ stops().length }}</div><div class="stat-detail">{{ days().length }} journées</div></div>
        <div class="stat-card"><div class="stat-label">Activités</div><div class="stat-value teal">{{ activities().length }}</div><div class="stat-detail">prévues</div></div>
        <div class="stat-card"><div class="stat-label">Hébergement</div><div class="stat-value vermillion">{{ euro(lodgingTotal()) }}</div><div class="stat-detail">{{ reservedCount() }}/{{ stops().length }} réservés</div></div>
        <div class="stat-card"><div class="stat-label">Transport</div><div class="stat-value gold">{{ euro(transportTotal()) }}</div><div class="stat-detail">estimé</div></div>
        <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value bamboo">{{ euro(lodgingTotal() + transportTotal()) }}</div><div class="stat-detail">{{ euro((lodgingTotal() + transportTotal()) / (t.travelers || 1)) }}/pers.</div></div>
      </div>

      <div class="dashboard-grid dash-split">
        <section>
          <div class="map-title-bar flex-between"><span>📅 Prochaines journées</span><a routerLink="/timeline" class="text-sm">Tout voir →</a></div>
          <div class="upcoming-list">
            @for (day of upcomingDays(); track day.date) {
              <div class="upcoming-row">
                <div class="upcoming-date">{{ day.short }}</div>
                <div class="upcoming-body">
                  <div class="upcoming-city">{{ day.city || '—' }}</div>
                  @if (day.activities.length) { <div class="upcoming-acts">{{ day.activities.join(' · ') }}</div> }
                </div>
              </div>
            } @empty {
              <p class="muted" style="padding:16px">Aucune journée à venir.</p>
            }
          </div>
        </section>

        <section class="stops-panel" style="max-height:520px">
          <div class="stops-panel-header"><span class="stops-panel-title">Étapes <span class="stops-count">{{ stops().length }}</span></span></div>
          <div class="stops-list">
            @for (stop of stops(); track stop.id ?? stop.city) {
              <a class="stop-card" [routerLink]="['/sheets']" [queryParams]="{ stop: stop.id }" style="display:block;text-decoration:none">
                <div class="card-head-row">
                  <div class="card-num-city">
                    <div class="card-city">{{ stop.city }}</div>
                    <div class="card-dates">{{ formatRange(stop.start_date, stop.end_date) }} · {{ nightsLabel(stop) }}</div>
                  </div>
                </div>
              </a>
            }
          </div>
        </section>
      </div>
    } @else {
      <div class="empty-state"><div style="font-size:2.5rem">🗾</div><h3>Aucun voyage configuré</h3><p>Ajoutez un voyage depuis l'administration.</p><a class="btn btn-primary" routerLink="/admin/trip">Administration</a></div>
    }
  `,
  styles: [`
    :host { display: block; }
    .upcoming-list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
    .upcoming-row { display: flex; gap: 14px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .upcoming-row:last-child { border-bottom: none; }
    .upcoming-date { font-family: 'Space Mono', monospace; font-size: .8rem; font-weight: 700; color: var(--accent); flex-shrink: 0; }
    .upcoming-city { font-weight: 600; }
    .upcoming-acts { font-size: .76rem; color: var(--ink3); margin-top: 2px; }
  `],
})
export class DashboardPage {
  private readonly content = inject(ContentService);

  readonly trip = this.content.trip;
  readonly stops = this.content.stops;
  readonly days = this.content.days;
  readonly activities = this.content.activities;
  readonly formatRange = formatRange;
  readonly nightsLabel = nightsLabel;
  readonly euro = euro;

  readonly lodgingTotal = computed(() => this.content.content().accommodations.reduce((s, a) => s + (a.price_total ?? 0), 0));
  readonly transportTotal = computed(() => this.content.content().transportLegs.reduce((s, l) => s + (l.price ?? 0), 0));
  readonly reservedCount = computed(() => this.content.stops().filter((s) => this.content.accommodationForStop(s.id)?.reserved).length);
  readonly countdownText = computed(() => {
    const start = this.trip()?.start_date;
    if (!start) return '—';
    const d = Math.ceil((new Date(start + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return d > 0 ? String(d) : d === 0 ? '✈️' : '🎌';
  });
  readonly countdownLabel = computed(() => {
    const start = this.trip()?.start_date;
    if (!start) return '';
    const d = Math.ceil((new Date(start + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return d > 0 ? 'jours avant le départ' : 'Bon voyage !';
  });

  readonly upcomingDays = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const acts = this.content.content().activities;
    const stopById = new Map(this.content.stops().map((s) => [s.id, s]));
    return this.days()
      .filter((d) => d.date >= today)
      .slice(0, 8)
      .map((d) => ({
        date: d.date,
        short: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
        city: stopById.get(d.stop_id ?? '')?.city ?? '',
        activities: acts.filter((a) => a.day_id === d.id).map((a) => a.title),
      }));
  });
}
