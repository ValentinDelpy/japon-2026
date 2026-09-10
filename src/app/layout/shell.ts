import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ContentService } from '../core/content.service';
import { ExchangeService } from '../core/exchange.service';
import { ThemeService } from '../core/theme.service';

interface NavItem { path: string; icon: string; label: string; }
interface NavGroup { label: string; items: NavItem[]; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
                <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ item.label }}</span>
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
        <div class="exchange-widget">
          <span class="exchange-label">1 € → ¥</span>
          <span class="exchange-value">{{ exchange.rate() ? exchange.rate()!.toFixed(2) : '---' }}</span>
        </div>
        <div class="sidebar-controls">
          <span class="sync-time">{{ syncLabel() }}</span>
          <button class="icon-btn refresh-btn" (click)="refresh()" title="Rafraîchir" aria-label="Rafraîchir">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button class="icon-btn theme-btn" (click)="theme.toggle()" [title]="themeLabel()">
            <span class="theme-icon">{{ themeIcon() }}</span><span class="theme-label">{{ themeLabel() }}</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <header class="mobile-header">
        <span class="mobile-title"><span class="mobile-title-jp">⛩️</span> Little Domo</span>
        <div class="mobile-header-actions">
          <button class="icon-btn theme-btn theme-btn-mobile" (click)="theme.toggle()" aria-label="Changer de thème">
            <span class="theme-icon">{{ themeIcon() }}</span>
          </button>
          <button class="icon-btn refresh-btn" (click)="refresh()" aria-label="Rafraîchir">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
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
            <span class="bottom-nav-icon">{{ item.icon }}</span><span class="bottom-nav-label">{{ item.label }}</span>
          </a>
        }
        <button type="button" class="bottom-nav-link" [class.active]="menuOpen()" (click)="openMenu()">
          <span class="bottom-nav-icon">☰</span><span class="bottom-nav-label">Plus</span>
        </button>
      </div>
    </nav>
  `,
  styles: [':host { display: block; }'],
})
export class Shell {
  readonly content = inject(ContentService);
  readonly exchange = inject(ExchangeService);
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);

  readonly groups: NavGroup[] = [
    { label: 'Voyage', items: [
      { path: 'dashboard', icon: '⛩️', label: 'Dashboard' },
      { path: 'itinerary', icon: '🗺️', label: 'Itinéraire' },
      { path: 'timeline', icon: '📅', label: 'Timeline' },
      { path: 'sheets', icon: '📖', label: 'Fiches Voyage' },
      { path: 'statistics', icon: '📊', label: 'Statistiques' },
    ] },
    { label: 'Préparation', items: [
      { path: 'packing', icon: '🎒', label: 'Packing List' },
      { path: 'checklist', icon: '✅', label: 'Check-list départ' },
      { path: 'logistics', icon: '🚉', label: 'Logistique Japon' },
    ] },
    { label: 'Sur place', items: [
      { path: 'restaurants', icon: '🍜', label: 'Restos & Souvenirs' },
      { path: 'phrasebook', icon: '🗣️', label: 'Phrasebook' },
      { path: 'culture', icon: '🎌', label: 'Agenda culturel' },
      { path: 'moodboard', icon: '📸', label: 'Moodboard' },
      { path: 'photos', icon: '🖼️', label: 'Photos' },
      { path: 'weather', icon: '🌤️', label: 'Météo & Saison' },
      { path: 'japan-101', icon: '🇯🇵', label: 'Japon 101' },
      { path: 'surprise', icon: '🎲', label: 'Surprise !' },
    ] },
    { label: 'Outils', items: [{ path: 'print', icon: '🖨️', label: 'Impression' }] },
  ];

  readonly bottomItems: NavItem[] = [
    { path: 'dashboard', icon: '⛩️', label: 'Accueil' },
    { path: 'timeline', icon: '📅', label: 'Timeline' },
    { path: 'itinerary', icon: '🗺️', label: 'Itinéraire' },
    { path: 'sheets', icon: '📖', label: 'Fiches' },
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
  readonly themeIcon = computed(() => this.theme.meta[this.theme.current()].icon);
  readonly themeLabel = computed(() => this.theme.meta[this.theme.current()].label);
  readonly syncLabel = computed(() => {
    const d = this.exchange.updatedAt();
    return d ? `Sync ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` : 'Sync : —';
  });

  constructor() {
    void this.exchange.load();
  }

  openMenu(): void { this.menuOpen.set(true); document.body.style.overflow = 'hidden'; }
  closeMenu(): void { this.menuOpen.set(false); document.body.style.overflow = ''; }
  refresh(): void { void this.content.load(); void this.exchange.load(); }
}
