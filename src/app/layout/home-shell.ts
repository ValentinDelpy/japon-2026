import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ContentService } from '../core/content.service';
import { EditModeService } from '../core/edit-mode.service';
import { ErrorReporter } from '../core/error.service';
import { ExchangeService } from '../core/exchange.service';
import { HomeViewService } from '../core/home-view.service';
import { SearchService } from '../core/search.service';
import { ThemeService } from '../core/theme.service';
import { Icon } from '../shared/icon';
import { CommandPalette } from './command-palette';
import { Sac } from './sac';

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard', today: "Aujourd’hui", itinerary: 'Itinéraire', timeline: 'Timeline',
  sheets: 'Fiches voyage', statistics: 'Statistiques', packing: 'Packing list', checklist: 'Check-list',
  logistics: 'Logistique', restaurants: 'Restos & souvenirs', discover: 'Découvrir', phrasebook: 'Phrasebook',
  culture: 'Agenda culturel', moodboard: 'Moodboard', photos: 'Photos', weather: 'Météo',
  'japan-101': 'Japon 101', surprise: 'Surprise', print: 'Impression',
};

/** Coque unique du voyageur : accueil Carnet/Atlas + outils sans sidebar. */
@Component({
  selector: 'app-home-shell',
  imports: [RouterOutlet, RouterLink, Icon, CommandPalette, Sac],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (offline()) { <div class="offline-banner" role="status">Hors ligne — données potentiellement périmées.</div> }
    @if (errors.message(); as msg) {
      <div class="error-toast" role="alert"><span>{{ msg }}</span><button type="button" (click)="errors.clear()" aria-label="Fermer">×</button></div>
    }

    <header class="home-top">
      <a class="home-brand" routerLink="/carnet">Little Domo <small>Very Arigatō</small></a>

      @if (isHome()) {
        <nav class="home-toggle" aria-label="Vue d’accueil">
          <a routerLink="/carnet" [class.active]="path() === 'carnet'" (click)="homeView.set('carnet')">Carnet</a>
          <a routerLink="/atlas" [class.active]="path() === 'atlas'" (click)="homeView.set('atlas')">Atlas</a>
        </nav>
      } @else {
        <div class="home-toolbar">
          <a class="home-back" routerLink="/carnet">← Carnet</a>
          <span class="home-current">{{ title() }}</span>
        </div>
      }

      <div class="home-actions">
        @if (exchange.rate(); as rate) { <span class="home-rate">1 € → ¥ {{ rate.toFixed(2) }}</span> }
        <button type="button" class="home-action home-action-primary" (click)="search.show()" aria-label="Rechercher"><app-icon name="search" [size]="15" /></button>
        <button type="button" class="home-action home-action-primary" (click)="sacOpen.set(true)">Le Sac</button>
        @if (isHome() && auth.isAdmin()) {
          <button type="button" class="home-action home-action-primary" [class.on]="edit.active()" (click)="edit.toggle()">{{ edit.active() ? 'Édition' : 'Éditer' }}</button>
        }
        <button type="button" class="home-action home-action-secondary" (click)="theme.toggle()" [attr.aria-label]="themeLabel()"><app-icon [name]="themeIconName()" [size]="15" /></button>
        @if (auth.isAdmin()) { <a class="home-action home-action-secondary" routerLink="/admin">Admin</a> }
        <button type="button" class="home-action home-action-secondary" (click)="auth.signOut()" aria-label="Déconnexion"><app-icon name="logout" [size]="15" /></button>
      </div>
    </header>

    @if (isHome() && edit.active()) {
      <div class="edit-bar" role="status">
        <span>{{ edit.count() }} modification(s)</span>
        @if (edit.error(); as e) { <span class="edit-error">{{ e }}</span> }
        <div class="edit-actions">
          <button type="button" class="edit-cancel" (click)="edit.cancel()">Annuler</button>
          <button type="button" class="edit-save" (click)="edit.save()" [disabled]="edit.saving()">{{ edit.saving() ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </div>
      </div>
    }

    @if (content.loading()) {
      <div class="loading-screen"><div class="loading-torii">⛩️</div><p class="loading-text">Chargement du voyage…</p><div class="loading-bar"><div class="loading-bar-fill"></div></div></div>
    } @else if (content.error()) {
      <div class="empty-state"><div style="font-size:2.5rem">📡</div><h3>Données indisponibles</h3><p>{{ content.error() }}</p><button class="btn btn-primary" style="margin-top:12px" (click)="refresh()">Réessayer</button></div>
    } @else {
      <div [class.page-container]="!isHome()">
        <div [class.route-view]="!isHome()"><router-outlet /></div>
      </div>
    }

    <app-sac [open]="sacOpen()" [isAdmin]="auth.isAdmin()" (close)="sacOpen.set(false)" (signOut)="auth.signOut()" (toggleTheme)="theme.toggle()" />
    <app-command-palette />
  `,
})
export class HomeShell {
  readonly content = inject(ContentService);
  readonly theme = inject(ThemeService);
  readonly search = inject(SearchService);
  readonly auth = inject(AuthService);
  readonly exchange = inject(ExchangeService);
  readonly edit = inject(EditModeService);
  readonly homeView = inject(HomeViewService);
  readonly errors = inject(ErrorReporter);
  readonly sacOpen = signal(false);
  readonly offline = signal(!navigator.onLine);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0].replace(/^\//, '').split('/')[0] || 'carnet'),
    ),
    { initialValue: this.router.url.split('?')[0].replace(/^\//, '').split('/')[0] || 'carnet' },
  );

  readonly path = computed(() => this.currentPath());
  readonly isHome = computed(() => this.path() === 'carnet' || this.path() === 'atlas');
  readonly title = computed(() => TITLES[this.path()] ?? 'Little Domo');
  readonly themeIconName = computed(() => this.theme.meta[this.theme.current()].iconName);
  readonly themeLabel = computed(() => this.theme.meta[this.theme.current()].label);

  constructor() {
    void this.exchange.load();
    const onKeydown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.search.toggle(); }
      if (e.key === 'Escape') this.search.close();
    };
    window.addEventListener('keydown', onKeydown);

    const onNetwork = (): void => {
      this.offline.set(!navigator.onLine);
      if (navigator.onLine) this.refresh();
    };
    window.addEventListener('online', onNetwork);
    window.addEventListener('offline', onNetwork);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('online', onNetwork);
      window.removeEventListener('offline', onNetwork);
    });
  }

  refresh(): void { void this.content.load(); void this.exchange.load(); }
}
