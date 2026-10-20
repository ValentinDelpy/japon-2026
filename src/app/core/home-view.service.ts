import { Injectable, signal } from '@angular/core';

export type HomeView = 'carnet' | 'atlas';

/** Mémoire de la dernière vue d'accueil choisie. */
@Injectable({ providedIn: 'root' })
export class HomeViewService {
  private readonly key = 'ldva.homeView';
  readonly view = signal<HomeView>(this.restore());

  set(view: HomeView): void {
    this.view.set(view);
    try { localStorage.setItem(this.key, view); } catch { /* stockage indisponible */ }
  }

  private restore(): HomeView {
    try { return localStorage.getItem(this.key) === 'atlas' ? 'atlas' : 'carnet'; } catch { return 'carnet'; }
  }
}
