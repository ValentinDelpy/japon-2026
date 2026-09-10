import { Injectable, inject } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import { ContentService } from './content.service';

/** Écritures admin : nécessite une session authentifiée (RLS). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly content = inject(ContentService);

  async save(table: string, row: Record<string, unknown>): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Mode démo : configurez Supabase pour enregistrer.');
    if (table === 'destinations') {
      await this.saveDestination(sb, row);
    } else {
      const { error } = await sb.from(table).upsert(row);
      if (error) throw new Error(error.message);
    }
    await this.content.load();
  }

  /** Les listes « highlights » / « funFacts » vivent dans des tables filles. */
  private async saveDestination(sb: SupabaseClient, row: Record<string, any>): Promise<void> {
    const { highlights, funFacts, ...rest } = row;
    const { data, error } = await sb.from('destinations').upsert(rest).select('id').single();
    if (error) throw new Error(error.message);
    const id = (data as { id: string }).id;
    for (const [table, list] of [['destination_highlights', highlights], ['destination_fun_facts', funFacts]] as const) {
      if (!Array.isArray(list)) continue;
      await sb.from(table).delete().eq('destination_id', id);
      if (list.length) await sb.from(table).insert(list.map((text: string, i: number) => ({ destination_id: id, text, order_index: i })));
    }
  }

  async remove(table: string, id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Mode démo : configurez Supabase pour supprimer.');
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.content.load();
  }
}
