import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'sakura' | 'dark';

interface ThemeMeta { next: Theme; icon: string; label: string; }

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'ldva-theme';
  readonly current = signal<Theme>('light');
  readonly meta: Record<Theme, ThemeMeta> = {
    light: { next: 'sakura', icon: '🌸', label: 'Sakura' },
    sakura: { next: 'dark', icon: '🌙', label: 'Sombre' },
    dark: { next: 'light', icon: '☀️', label: 'Clair' },
  };

  init(): void {
    const saved = localStorage.getItem(this.KEY) as Theme | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.apply(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle(): void {
    this.apply(this.meta[this.current()].next);
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    this.current.set(theme);
  }
}
