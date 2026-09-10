import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<Session | null>(null);
  private readonly ready = signal(false);

  readonly isAuthenticated = computed(() => !!this.session());
  readonly isReady = this.ready.asReadonly();
  readonly user = computed(() => this.session()?.user ?? null);

  constructor() {
    if (!supabase) { this.ready.set(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.ready.set(true);
    });
    supabase.auth.onAuthStateChange((_e, s) => this.session.set(s));
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!supabase) throw new Error('Supabase non configuré (mode démo).');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    await supabase?.auth.signOut();
  }

  get canUseBackend(): boolean { return supabaseConfigured; }
}
