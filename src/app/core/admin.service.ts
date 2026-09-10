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
    const { error } = await supabase.from(table).upsert(row);
    if (error) throw new Error(error.message);
    await this.content.load();
  }

  async remove(table: string, id: string): Promise<void> {
    if (!supabase) throw new Error('Mode démo : configurez Supabase pour supprimer.');
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.content.load();
  }
}
