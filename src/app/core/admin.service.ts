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

  async remove(table: string, id: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.content.load();
  }
}
