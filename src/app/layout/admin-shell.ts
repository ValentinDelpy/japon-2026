import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ContentService } from '../core/content.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <a class="admin-brand" routerLink="/admin/overview">
          <span class="logo-mark">日</span>
          <span><strong>Admin</strong><small>Little Domo</small></span>
        </a>
        <nav class="admin-nav">
          @for (item of items; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.icon }} {{ item.label }}</a>
          }
        </nav>
        <div class="admin-sidebar-footer">
          <a class="admin-link" routerLink="/dashboard" target="_blank">↗ Voir le site</a>
          <button class="admin-link" (click)="toggleTheme()">{{ themeIcon() }} {{ themeLabel() }}</button>
          @if (auth.canUseBackend) {
            <button class="admin-link" (click)="signOut()">⎋ Déconnexion</button>
          }
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <span class="muted">{{ content.trip()?.title ?? 'Voyage' }}</span>
          <span class="spacer"></span>
          @if (auth.user(); as u) { <span class="tag">{{ u.email }}</span> }
          @if (content.source() === 'seed') { <span class="tag tag-todo">Mode démo (seed.json)</span> }
        </header>
        <div class="admin-content"><router-outlet /></div>
      </main>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class AdminShell {
  readonly auth = inject(AuthService);
  readonly content = inject(ContentService);
  private readonly theme = inject(ThemeService);

  readonly items = [
    { path: 'overview', icon: '📊', label: "Vue d'ensemble" },
    { path: 'trip', icon: '✈️', label: 'Voyage' },
    { path: 'stops', icon: '📍', label: 'Étapes' },
    { path: 'days', icon: '📅', label: 'Journées' },
    { path: 'activities', icon: '🎯', label: 'Activités' },
    { path: 'reservations', icon: '🎫', label: 'Réservations' },
    { path: 'content', icon: '📝', label: 'Contenu' },
  ];

  themeIcon = () => this.theme.meta[this.theme.current()].icon;
  themeLabel = () => this.theme.meta[this.theme.current()].label;
  toggleTheme(): void { this.theme.toggle(); }
  signOut(): void { void this.auth.signOut(); }
}
