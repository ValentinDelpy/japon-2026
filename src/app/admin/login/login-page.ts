import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-wrap">
      <form class="login-card" (ngSubmit)="submit()">
        <span class="logo-mark" style="margin:0 auto 12px">日</span>
        <h1>Administration</h1>
        <p class="muted" style="margin-bottom:16px">Little Domo Very Arigatō</p>

        @if (!auth.canUseBackend) {
          <div class="notice">Supabase n'est pas configuré : l'admin est accessible en mode démo (lecture seule).</div>
          <a class="btn btn-primary" style="width:100%" routerLink="/admin">Entrer en mode démo</a>
        } @else {
          <div class="field"><label>Email</label><input class="input" type="email" name="email" [(ngModel)]="email" required></div>
          <div class="field"><label>Mot de passe</label><input class="input" type="password" name="password" [(ngModel)]="password" required></div>
          @if (error()) { <p class="error">{{ error() }}</p> }
          <button class="btn btn-primary" style="width:100%" type="submit" [disabled]="loading()">{{ loading() ? 'Connexion…' : 'Se connecter' }}</button>
        }
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: var(--bg); }
    .login-card { width: 100%; max-width: 360px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 28px; box-shadow: var(--shadow-lg); text-align: center; }
    .login-card h1 { font-size: 1.3rem; }
    .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .78rem; margin-bottom: 14px; text-align: left; }
    .error { color: var(--accent2); font-size: .8rem; margin-bottom: 10px; }
  `],
})
export class LoginPage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    if (!this.auth.canUseBackend) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.signIn(this.email, this.password);
      await this.router.navigate(['/admin']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      this.loading.set(false);
    }
  }
}
