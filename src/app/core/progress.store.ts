import { Injectable, WritableSignal, signal } from '@angular/core';

/** État local (coché/décoché) persisté dans localStorage — fonctionne offline. */
@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly cache = new Map<string, WritableSignal<Record<string, boolean>>>();

  state(key: string): WritableSignal<Record<string, boolean>> {
    if (!this.cache.has(key)) this.cache.set(key, signal(this.read(key)));
    return this.cache.get(key)!;
  }

  toggle(key: string, id: string): void {
    const s = this.state(key);
    const next = { ...s(), [id]: !s()[id] };
    s.set(next);
    try { localStorage.setItem('ldva-' + key, JSON.stringify(next)); } catch { /* stockage indisponible */ }
  }

  count(key: string, ids: string[]): number {
    const s = this.state(key)();
    return ids.filter((id) => s[id]).length;
  }

  private read(key: string): Record<string, boolean> {
    try { return JSON.parse(localStorage.getItem('ldva-' + key) || '{}'); } catch { return {}; }
  }
}
