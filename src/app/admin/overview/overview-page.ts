import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { euro } from '../../core/format';

@Component({
  selector: 'app-overview-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>Vue d'ensemble</h1></div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-label">Étapes</div><div class="stat-value indigo">{{ counts().stops }}</div></div>
      <div class="stat-card"><div class="stat-label">Journées</div><div class="stat-value teal">{{ counts().days }}</div></div>
      <div class="stat-card"><div class="stat-label">Activités</div><div class="stat-value gold">{{ counts().activities }}</div></div>
      <div class="stat-card"><div class="stat-label">Réservations</div><div class="stat-value vermillion">{{ counts().reservations }}</div></div>
      <div class="stat-card"><div class="stat-label">Budget logement</div><div class="stat-value bamboo">{{ euro(counts().lodging) }}</div></div>
    </div>

    <div class="admin-cards">
      <a class="admin-card" routerLink="/admin/trip"><span>✈️</span><strong>Voyage</strong><small>Nom, dates, paramètres</small></a>
      <a class="admin-card" routerLink="/admin/stops"><span>📍</span><strong>Étapes</strong><small>Villes et hébergements</small></a>
      <a class="admin-card" routerLink="/admin/days"><span>📅</span><strong>Journées</strong><small>{{ counts().days }} journées</small></a>
      <a class="admin-card" routerLink="/admin/activities"><span>🎯</span><strong>Activités</strong><small>{{ counts().activities }} activités</small></a>
      <a class="admin-card" routerLink="/admin/reservations"><span>🎫</span><strong>Réservations</strong><small>{{ counts().reservations }} entrées</small></a>
      <a class="admin-card" routerLink="/admin/content"><span>📝</span><strong>Contenu</strong><small>Restos, phrases, Japon 101…</small></a>
    </div>

    <div class="admin-page-header" style="margin-top:28px"><h1 style="font-size:1.05rem">Contenu manquant</h1></div>
    <ul class="admin-todos">
      @for (t of todos(); track t) { <li>{{ t }}</li> }
      @empty { <li class="muted">Tout est renseigné ✓</li> }
    </ul>
  `,
  styles: [`
    :host { display: block; }
    .admin-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .admin-card { display: flex; flex-direction: column; gap: 3px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); color: var(--ink); transition: all .2s; }
    .admin-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .admin-card span { font-size: 1.4rem; }
    .admin-card small { color: var(--ink3); }
    .admin-todos { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .admin-todos li { padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; font-size: .82rem; }
  `],
})
export class OverviewPage {
  private readonly content = inject(ContentService);
  readonly euro = euro;

  readonly counts = computed(() => ({
    stops: this.content.stops().length,
    days: this.content.days().length,
    activities: this.content.activities().length,
    reservations: this.content.content().reservations.length,
    lodging: this.content.content().accommodations.reduce((s, a) => s + (a.price_total ?? 0), 0),
  }));

  readonly todos = computed(() => {
    const t: string[] = [];
    if (!this.content.trip()) t.push('Aucun voyage configuré.');
    if (!this.content.stops().length) t.push('Aucune étape renseignée.');
    if (!this.content.activities().length) t.push('Aucune activité planifiée.');
    const withoutLodging = this.content.stops().filter((s) => !this.content.accommodationForStop(s.id));
    if (withoutLodging.length) t.push(`${withoutLodging.length} étape(s) sans hébergement.`);
    if (!this.content.content().reservations.length) t.push('Aucune réservation enregistrée.');
    return t;
  });
}
