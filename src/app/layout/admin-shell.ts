import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ContentService } from '../core/content.service';
import { ThemeService } from '../core/theme.service';
import { Icon, IconName } from '../shared/icon';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
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
            <a [routerLink]="item.path" routerLinkActive="active"><app-icon [name]="item.icon" [size]="16" /> {{ item.label }}</a>
          }
        </nav>
        <div class="admin-sidebar-footer">
          <a class="admin-link" routerLink="/dashboard" target="_blank"><app-icon name="external" [size]="14" /> Voir le site</a>
          <button class="admin-link" (click)="toggleTheme()"><app-icon [name]="themeIconName()" [size]="14" /> {{ themeLabel() }}</button>
          @if (auth.user()) {
            <button class="admin-link" (click)="signOut()"><app-icon name="logout" [size]="14" /> Déconnexion</button>
          }
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <span class="muted">{{ content.trip()?.title ?? 'Voyage' }}</span>
          <span class="spacer"></span>
          @if (auth.user(); as u) { <span class="tag"><app-icon name="user" [size]="12" /> {{ u.email }}</span> }
        </header>
        <div class="admin-content"><router-outlet /></div>
      </main>
    </div>
  `,
  styles: [':host { display: block; } .admin-nav a { display: flex; align-items: center; gap: 8px; } .admin-link { display: flex; align-items: center; gap: 8px; } .tag { display: inline-flex; align-items: center; gap: 5px; }'],
})
export class AdminShell {
  readonly auth = inject(AuthService);
  readonly content = inject(ContentService);
  private readonly theme = inject(ThemeService);

  readonly items: { path: string; icon: IconName; label: string }[] = [
    { path: 'overview', icon: 'chart', label: "Vue d'ensemble" },
    { path: 'users', icon: 'user', label: 'Utilisateurs' },
    { path: 'trip', icon: 'route', label: 'Voyage' },
    { path: 'stops', icon: 'pin', label: 'Étapes' },
    { path: 'accommodations', icon: 'bed', label: 'Hébergements' },
    { path: 'transport', icon: 'train', label: 'Transports' },
    { path: 'days', icon: 'calendar', label: 'Journées' },
    { path: 'activities', icon: 'sparkles', label: 'Activités' },
    { path: 'reservations', icon: 'ticket', label: 'Réservations' },
    { path: 'restaurants', icon: 'utensils', label: 'Restaurants' },
    { path: 'souvenirs', icon: 'gift', label: 'Souvenirs' },
    { path: 'phrases', icon: 'message', label: 'Phrases' },
    { path: 'culture', icon: 'flag', label: 'Agenda' },
    { path: 'weather', icon: 'sun', label: 'Météo' },
    { path: 'surprise', icon: 'dice', label: 'Surprise' },
    { path: 'photos', icon: 'camera', label: 'Photos' },
    { path: 'destinations', icon: 'map', label: 'Destinations' },
    { path: 'packing', icon: 'backpack', label: 'Packing' },
    { path: 'checklist', icon: 'check', label: 'Check-list' },
    { path: 'moodboard', icon: 'image', label: 'Moodboard' },
    { path: 'japan101', icon: 'info', label: 'Japon 101' },
    { path: 'logistics', icon: 'compass', label: 'Logistique' },
    { path: 'content', icon: 'book', label: 'Contenu' },
  ];

  themeIconName = () => this.theme.meta[this.theme.current()].iconName;
  themeLabel = () => this.theme.meta[this.theme.current()].label;
  toggleTheme(): void { this.theme.toggle(); }
  signOut(): void { void this.auth.signOut(); }
}
