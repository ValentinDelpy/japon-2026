import { Injectable, inject } from '@angular/core';
import { supabase, supabaseConfigured } from './supabase';
import { ContentService } from './content.service';

/** Écritures admin : nécessite Supabase configuré (RLS admin). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly content = inject(ContentService);

  get enabled(): boolean { return supabaseConfigured; }

  async save(table: string, row: Record<string, unknown>): Promise<void> {
    if (!supabase) throw new Error('Mode démo : configurez Supabase pour enregistrer.');
    if (table === 'destinations') {
      await this.saveDestination(row);
    } else {
      const { error } = await supabase.from(table).upsert(row);
      if (error) throw new Error(error.message);
    }
    await this.content.load();
  }

  /** Les listes « highlights » / « funFacts » vivent dans des tables filles. */
  private async saveDestination(row: Record<string, any>): Promise<void> {
    const { highlights, funFacts, ...rest } = row;
    const { data, error } = await supabase!.from('destinations').upsert(rest).select('id').single();
    if (error) throw new Error(error.message);
    const id = (data as { id: string }).id;
    for (const [table, list] of [['destination_highlights', highlights], ['destination_fun_facts', funFacts]] as const) {
      if (!Array.isArray(list)) continue;
      await supabase!.from(table).delete().eq('destination_id', id);
      if (list.length) {
        await supabase!.from(table).insert(list.map((text: string, i: number) => ({ destination_id: id, text, order_index: i })));
      }
    }
  }

  async remove(table: string, id: string): Promise<void> {
    if (!supabase) throw new Error('Mode démo : configurez Supabase pour supprimer.');
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.content.load();
  }
}
