import { Injectable, inject, signal } from '@angular/core';
import { AdminService } from './admin.service';

export interface EditDraft {
  table: string;
  id: string;
  patch: Record<string, unknown>;
}

/** Édition inline réservée aux administrateurs : brouillons puis sauvegarde par lot. */
@Injectable({ providedIn: 'root' })
export class EditModeService {
  private readonly admin = inject(AdminService);
  readonly active = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly count = signal(0);
  private readonly drafts = new Map<string, EditDraft>();

  toggle(): void {
    const next = !this.active();
    this.active.set(next);
    if (!next) this.clear();
  }

  stage(table: string, id: string | null | undefined, patch: Record<string, unknown>): void {
    if (!id) return;
    const key = `${table}:${id}`;
    const current = this.drafts.get(key);
    this.drafts.set(key, { table, id, patch: { ...(current?.patch ?? {}), ...patch } });
    this.count.set(this.drafts.size);
  }

  cancel(): void {
    this.clear();
    this.active.set(false);
  }

  async save(): Promise<void> {
    if (!this.drafts.size) { this.active.set(false); return; }
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.admin.saveMany([...this.drafts.values()]);
      this.clear();
      this.active.set(false);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.saving.set(false);
    }
  }

  private clear(): void {
    this.drafts.clear();
    this.count.set(0);
    this.error.set(null);
  }
}
