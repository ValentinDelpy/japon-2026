import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { formatDay, nightsLabel } from '../../core/format';
import { resolveToday } from '../../core/today';

@Component({
  selector: 'app-today-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx(); as c) {
      @switch (c.phase) {
        @case ('during') {
          <div class="live-hero">
            <div class="live-dot">● En direct</div>
            <div class="live-head">
              <div>
                <div class="live-day">Jour {{ c.dayIndex }} / {{ c.totalDays }}</div>
                <h1>{{ c.stop?.city || 'En route' }}</h1>
                <p class="live-date">{{ formatDay(c.date) }}</p>
              </div>
              <div class="live-progress"><div class="live-progress-fill" [style.width.%]="c.progressPct"></div></div>
            </div>
          </div>

          @if (c.nextActivity; as next) {
            <div class="next-card">
              <div class="next-label">Prochaine activité</div>
              <div class="next-time">{{ next.time || '—' }}</div>
              <div class="next-title">{{ next.title }}</div>
              @if (next.description) { <div class="next-desc">{{ next.description }}</div> }
              @if (next.link) { <a class="cell-link" [href]="next.link" target="_blank" rel="noopener">Plus d'infos →</a> }
            </div>
          } @else {
            <div class="next-card next-card-done"><div class="next-label">Journée</div><div class="next-title">Rien de prévu — profitez !</div></div>
          }

          <section class="home-panel mb-2">
            <div class="map-title-bar">Programme du jour</div>
            @if (c.activities.length) {
              <ul class="live-timeline">
                @for (a of c.activities; track a.id; let last = $last) {
                  <li [class.done]="isPast(a.time)" [class.next]="a.id === c.nextActivity?.id">
                    <span class="live-time">{{ a.time || '—' }}</span>
                    <span class="live-act">{{ a.title }}</span>
                    @if (a.duration) { <span class="live-dur">{{ a.duration }}</span> }
                  </li>
                }
              </ul>
            } @else { <p class="muted" style="padding:16px">Aucune activité planifiée.</p> }
          </section>

          @if (c.accommodation; as a) {
            <section class="home-panel mb-2">
              <div class="map-title-bar">Votre hébergement</div>
              <div class="live-lodge">
                @if (a.url) { <a class="live-lodge-name" [href]="a.url" target="_blank" rel="noopener">{{ a.name }} →</a> }
                @else { <span class="live-lodge-name">{{ a.name }}</span> }
                @if (a.address) { <div class="muted">{{ a.address }}</div> }
                @if (a.check_out) { <div class="muted">Départ : {{ formatDay(a.check_out) }}</div> }
              </div>
            </section>
          }

          <div class="quick-links">
            <a class="quick-link" routerLink="/phrasebook"><span>🗣️</span> Phrasebook</a>
            <a class="quick-link" routerLink="/logistics"><span>🚉</span> Logistique</a>
            <a class="quick-link" routerLink="/restaurants"><span>🍜</span> Restos</a>
            <a class="quick-link" routerLink="/itinerary"><span>🗺️</span> Itinéraire</a>
          </div>
        }

        @case ('before') {
          <div class="page-header"><h1>Sur place <span class="jp-accent">旅先</span></h1><p class="subtitle">Le mode « sur place » s'active pendant le voyage.</p></div>
          <div class="before-card">
            <div class="before-count">{{ c.daysUntilStart }}</div>
            <div class="before-label">jours avant le départ</div>
            <a class="btn btn-primary" routerLink="/dashboard">Voir le dashboard</a>
          </div>
        }

        @case ('after') {
          <div class="page-header"><h1>Sur place <span class="jp-accent">旅先</span></h1><p class="subtitle">Le voyage est terminé.</p></div>
          <div class="before-card">
            <div class="before-count">🎌</div>
            <div class="before-label">Bon retour !</div>
            <div class="quick-links">
              <a class="quick-link" routerLink="/photos"><span>🖼️</span> Photos</a>
              <a class="quick-link" routerLink="/statistics"><span>📊</span> Statistiques</a>
            </div>
          </div>
        }

        @default {
          <div class="empty-state"><div style="font-size:2.5rem">📍</div><h3>Mode sur place</h3><p>Configurez un voyage pour l'activer.</p></div>
        }
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .live-hero { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 26px 28px; box-shadow: var(--shadow-sm); margin-bottom: 18px; }
    .live-dot { display: inline-block; color: var(--accent); font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
    .live-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .live-day { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); }
    .live-hero h1 { font-size: clamp(1.7rem, 3.6vw, 2.6rem); margin: 2px 0; }
    .live-date { color: var(--ink3); }
    .live-progress { width: 220px; height: 6px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
    .live-progress-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width .6s var(--ease); }
    .next-card { background: var(--ink); color: var(--bg); border-radius: var(--r-lg); padding: 22px 26px; margin-bottom: 18px; }
    .next-label { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; opacity: .7; }
    .next-time { font-family: 'Space Mono', monospace; font-size: 1.6rem; color: var(--seal-l); margin: 4px 0; }
    .next-title { font-family: 'Shippori Mincho', serif; font-size: 1.35rem; }
    .next-desc { opacity: .8; margin-top: 4px; }
    .next-card-done .next-title { font-family: 'Outfit', sans-serif; }
    .home-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
    .live-timeline { list-style: none; }
    .live-timeline li { display: flex; align-items: baseline; gap: 12px; padding: 12px 18px; border-bottom: 1px solid var(--border); }
    .live-timeline li:last-child { border-bottom: none; }
    .live-timeline li.done { opacity: .45; }
    .live-timeline li.next { background: var(--accent-l); }
    .live-time { font-family: 'Space Mono', monospace; font-size: .82rem; color: var(--accent); min-width: 48px; }
    .live-act { flex: 1; font-weight: 600; }
    .live-dur { font-size: .72rem; color: var(--ink3); }
    .live-lodge { padding: 16px 18px; }
    .live-lodge-name { font-family: 'Shippori Mincho', serif; font-size: 1.1rem; }
    .quick-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 18px; }
    .quick-link { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); color: var(--ink); font-weight: 600; font-size: .85rem; transition: border-color .2s, transform .2s; }
    .quick-link:hover { border-color: var(--accent); transform: translateY(-2px); }
    .before-card { text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 48px 24px; }
    .before-count { font-family: 'Shippori Mincho', serif; font-size: 3.4rem; color: var(--accent); line-height: 1; }
    .before-label { color: var(--ink3); margin: 8px 0 18px; }
  `],
})
export class TodayPage {
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly now = signal(new Date());

  readonly formatDay = formatDay;
  readonly nightsLabel = nightsLabel;

  readonly ctx = computed(() =>
    resolveToday(
      {
        trip: this.content.trip(),
        stops: this.content.stops(),
        days: this.content.days(),
        activities: this.content.activities(),
        accommodations: this.content.content().accommodations,
      },
      this.now()
    )
  );

  constructor() {
    const tick = setInterval(() => this.now.set(new Date()), 60000);
    this.destroyRef.onDestroy(() => clearInterval(tick));
  }

  isPast(time?: string | null): boolean {
    if (!time) return false;
    const now = this.now();
    return time < `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}
