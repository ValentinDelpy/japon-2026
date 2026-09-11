import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, supabaseConfigured } from './supabase';

export interface Member {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<Session | null>(null);
  private readonly ready = signal(false);
  private readonly admin = signal(false);
  private readyResolve!: () => void;
  private readonly readyPromise = new Promise<void>((r) => (this.readyResolve = r));

  readonly isAuthenticated = computed(() => !!this.session());
  readonly isReady = this.ready.asReadonly();
  readonly isAdmin = this.admin.asReadonly();
  readonly user = computed(() => this.session()?.user ?? null);

  constructor() {
    const sb = getSupabase();
    if (!sb) { this.ready.set(true); this.readyResolve(); return; }
    sb.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.ready.set(true);
      this.readyResolve();
      void this.refreshAdmin();
    });
    sb.auth.onAuthStateChange((_e, s) => { this.session.set(s); void this.refreshAdmin(); });
  }

  /** Attend la fin du chargement initial de session. */
  waitReady(): Promise<void> { return this.readyPromise; }

  private async refreshAdmin(): Promise<void> {
    const sb = getSupabase();
    const uid = this.session()?.user?.id;
    if (!sb || !uid) { this.admin.set(false); return; }
    const { data } = await sb.from('admin_users').select('user_id').eq('user_id', uid).maybeSingle();
    this.admin.set(!!data);
  }

  async signIn(email: string, password: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.refreshAdmin();
  }

  async signOut(): Promise<void> {
    await getSupabase()?.auth.signOut();
    this.admin.set(false);
  }

  get canUseBackend(): boolean { return supabaseConfigured(); }

  // ── Gestion des comptes (RPC sécurisées, admins uniquement) ──
  async listUsers(): Promise<Member[]> {
    const sb = getSupabase();
    if (!sb) return [];
    const { data, error } = await sb.rpc('admin_list_users');
    if (error) throw new Error(error.message);
    return (data ?? []) as Member[];
  }

  async createUser(email: string, password: string, isAdmin: boolean): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase non configuré.');
    const { error } = await sb.rpc('admin_create_user', { p_email: email, p_password: password, p_is_admin: isAdmin });
    if (error) throw new Error(error.message);
  }

  async setAdmin(userId: string, isAdmin: boolean): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.rpc('admin_set_admin', { p_user: userId, p_is_admin: isAdmin });
    if (error) throw new Error(error.message);
  }

  async deleteUser(userId: string): Promise<void> {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.rpc('admin_delete_user', { p_user: userId });
    if (error) throw new Error(error.message);
  }
}
