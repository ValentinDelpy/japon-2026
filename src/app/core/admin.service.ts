import { Injectable, inject } from '@angular/core';
import { getSupabase } from './supabase';
import { ContentService } from './content.service';

/** Écritures admin : nécessite une session authentifiée (RLS). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly content = inject(ContentService);

  async save(table: string, row: Record<string, unknown>): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.from(table).upsert(row);
    if (error) throw new Error(error.message);
    await this.content.load();
  }

  /** Sauvegarde atomique d'un lot (RPC transactionnelle), puis recharge le contenu. */
  async saveMany(items: { table: string; id: string; patch: Record<string, unknown> }[]): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.rpc('apply_inline_edits', { p_items: items });
    if (error && error.code !== 'PGRST202') throw new Error(error.message);
    if (error) {
      // Base pas encore migrée : repli séquentiel (non atomique).
      for (const item of items) {
        const { error: e } = await sb.from(item.table).update(item.patch).eq('id', item.id);
        if (e) throw new Error(`${item.table}: ${e.message}`);
      }
    }
    await this.content.load();
  }

  async remove(table: string, id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.content.load();
  }
}
