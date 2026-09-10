import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ContentService } from '../core/content.service';
import { ExchangeService } from '../core/exchange.service';
import { SearchService } from '../core/search.service';
import { ThemeService } from '../core/theme.service';
import { Icon, IconName } from '../shared/icon';
import { CommandPalette } from './command-palette';

interface NavItem { path: string; icon: IconName; label: string; }
interface NavGroup { label: string; items: NavItem[]; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommandPalette, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mobile-overlay" [class.active]="menuOpen()" (click)="closeMenu()"></div>

    <nav class="sidebar" [class.open]="menuOpen()">
      <div class="sidebar-header">
        <span class="logo-mark" aria-hidden="true">日</span>
        <div class="logo-text">
          <span class="logo-title">Little Domo</span>
          <span class="logo-subtitle">Very Arigatō</span>
        </div>
        <button class="mobile-close" (click)="closeMenu()" aria-label="Fermer le menu">&times;</button>
      </div>

      <ul class="nav-links">
        @for (group of groups; track group.label) {
          <li class="nav-group-label" [class.nav-group-label-faded]="group.label === 'Outils'">{{ group.label }}</li>
          @for (item of group.items; track item.path) {
            <li>
              <a class="nav-link" [routerLink]="item.path" routerLinkActive="active" (click)="closeMenu()">
                <app-icon class="nav-icon" [name]="item.icon" [size]="17" /><span class="nav-label">{{ item.label }}</span>
              </a>
            </li>
          }
        }
      </ul>

      @if (daysLeft() !== null) {
        <div class="countdown-widget">
          <div class="countdown-days">{{ countdownText() }}</div>
          <div class="countdown-label">{{ countdownLabel() }}</div>
        </div>
      }

      <div class="sidebar-footer">
        <button class="sidebar-search" (click)="search.show()"><app-icon class="ss-icon" name="search" [size]="15" /> Rechercher <kbd>Ctrl K</kbd></button>
        <a class="admin-seal" routerLink="/admin">
          <span class="admin-seal-mark">印</span>
          <span>Administration</span>
        </a>
        <div class="exchange-widget">
          <span class="exchange-label">1 € → ¥</span>
          <span class="exchange-value">{{ exchange.rate() ? exchange.rate()!.toFixed(2) : '---' }}</span>
        </div>
        <div class="sidebar-controls">
          <span class="sync-time">{{ syncLabel() }}</span>
          <button class="icon-btn refresh-btn" (click)="refresh()" title="Rafraîchir" aria-label="Rafraîchir"><app-icon name="refresh" [size]="14" /></button>
          <button class="icon-btn theme-btn" (click)="theme.toggle()" [title]="themeLabel()">
            <app-icon class="theme-icon" [name]="themeIconName()" [size]="14" /><span class="theme-label">{{ themeLabel() }}</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <header class="mobile-header">
        <span class="mobile-title"><span class="mobile-title-jp">日</span><span class="mobile-title-text">Little Domo</span></span>
        <span class="topbar-title">{{ pageTitle() }}</span>
        <div class="mobile-header-actions">
          <button class="icon-btn" (click)="search.show()" aria-label="Rechercher"><app-icon name="search" [size]="16" /></button>
          <a class="icon-btn admin-btn" routerLink="/admin" aria-label="Administration" title="Administration">印</a>
          <button class="icon-btn theme-btn theme-btn-mobile" (click)="theme.toggle()" aria-label="Changer de thème">
            <app-icon class="theme-icon" [name]="themeIconName()" [size]="15" />
          </button>
          <button class="icon-btn refresh-btn" (click)="refresh()" aria-label="Rafraîchir"><app-icon name="refresh" [size]="14" /></button>
        </div>
      </header>

      <div class="page-container">
        @if (content.loading()) {
          <div class="loading-screen">
            <div class="loading-torii">⛩️</div>
            <p class="loading-text">Chargement du voyage…</p>
            <div class="loading-bar"><div class="loading-bar-fill"></div></div>
          </div>
        } @else if (content.error()) {
          <div class="empty-state">
            <div style="font-size:2.5rem">📡</div>
            <h3>Données indisponibles</h3>
            <p>{{ content.error() }}</p>
            <button class="btn btn-primary" style="margin-top:12px" (click)="refresh()">Réessayer</button>
          </div>
        } @else {
          <div class="route-view"><router-outlet /></div>
        }
      </div>
    </main>

    <nav class="bottom-nav">
      <div class="bottom-nav-inner">
        @for (item of bottomItems; track item.path) {
          <a class="bottom-nav-link" [routerLink]="item.path" routerLinkActive="active">
            <app-icon class="bottom-nav-icon" [name]="item.icon" [size]="20" /><span class="bottom-nav-label">{{ item.label }}</span>
          </a>
        }
        <button type="button" class="bottom-nav-link" [class.active]="menuOpen()" (click)="openMenu()" aria-label="Plus de pages">
          <app-icon class="bottom-nav-icon" name="menu" [size]="20" /><span class="bottom-nav-label">Plus</span>
        </button>
      </div>
    </nav>

    <app-command-palette />
  `,
  styles: [':host { display: block; }'],
})
export class Shell {
  readonly content = inject(ContentService);
  readonly exchange = inject(ExchangeService);
  readonly theme = inject(ThemeService);
  readonly search = inject(SearchService);
  readonly menuOpen = signal(false);
  private readonly router = inject(Router);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => (this.router.url.split('?')[0].replace(/^\//, '').split('/')[0] || 'dashboard'))
    ),
    { initialValue: this.router.url.split('?')[0].replace(/^\//, '').split('/')[0] || 'dashboard' }
  );
  readonly pageTitle = computed(
    () => this.groups.flatMap((g) => g.items).find((i) => i.path === this.currentPath())?.label ?? 'Little Domo'
  );

  readonly groups: NavGroup[] = [
    { label: 'Voyage', items: [
      { path: 'dashboard', icon: 'home', label: 'Dashboard' },
      { path: 'today', icon: 'pin', label: "Aujourd'hui" },
      { path: 'itinerary', icon: 'route', label: 'Itinéraire' },
      { path: 'timeline', icon: 'calendar', label: 'Timeline' },
      { path: 'sheets', icon: 'book', label: 'Fiches Voyage' },
      { path: 'statistics', icon: 'chart', label: 'Statistiques' },
    ] },
    { label: 'Préparation', items: [
      { path: 'packing', icon: 'backpack', label: 'Packing List' },
      { path: 'checklist', icon: 'check', label: 'Check-list départ' },
      { path: 'logistics', icon: 'train', label: 'Logistique Japon' },
    ] },
    { label: 'Sur place', items: [
      { path: 'discover', icon: 'compass', label: 'Découvrir' },
      { path: 'restaurants', icon: 'utensils', label: 'Restos & Souvenirs' },
      { path: 'phrasebook', icon: 'message', label: 'Phrasebook' },
      { path: 'culture', icon: 'flag', label: 'Agenda culturel' },
      { path: 'moodboard', icon: 'image', label: 'Moodboard' },
      { path: 'photos', icon: 'camera', label: 'Photos' },
      { path: 'weather', icon: 'sun', label: 'Météo & Saison' },
      { path: 'japan-101', icon: 'info', label: 'Japon 101' },
      { path: 'surprise', icon: 'dice', label: 'Surprise !' },
    ] },
    { label: 'Outils', items: [{ path: 'print', icon: 'printer', label: 'Impression' }] },
  ];

  readonly bottomItems: NavItem[] = [
    { path: 'dashboard', icon: 'home', label: 'Accueil' },
    { path: 'today', icon: 'pin', label: "Aujourd'hui" },
    { path: 'timeline', icon: 'calendar', label: 'Timeline' },
    { path: 'itinerary', icon: 'route', label: 'Itinéraire' },
  ];

  readonly daysLeft = computed(() => {
    const start = this.content.trip()?.start_date;
    if (!start) return null;
    return Math.ceil((new Date(start + 'T00:00:00').getTime() - Date.now()) / 86400000);
  });
  readonly countdownText = computed(() => {
    const d = this.daysLeft();
    return d === null ? '—' : d > 0 ? String(d) : d === 0 ? '✈️' : '🎌';
  });
  readonly countdownLabel = computed(() => ((this.daysLeft() ?? 1) > 0 ? 'jours avant le départ' : 'Bon voyage !'));
  readonly themeIconName = computed(() => this.theme.meta[this.theme.current()].iconName);
  readonly themeLabel = computed(() => this.theme.meta[this.theme.current()].label);
  readonly syncLabel = computed(() => {
    const d = this.exchange.updatedAt();
    return d ? `Sync ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` : 'Sync : —';
  });

  constructor() {
    void this.exchange.load();
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.search.toggle(); }
      if (e.key === 'Escape') this.search.close();
    });
  }

  openMenu(): void { this.menuOpen.set(true); document.body.style.overflow = 'hidden'; }
  closeMenu(): void { this.menuOpen.set(false); document.body.style.overflow = ''; }
  refresh(): void { void this.content.load(); void this.exchange.load(); }
}
