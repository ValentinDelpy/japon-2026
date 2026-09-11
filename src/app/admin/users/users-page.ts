import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Member } from '../../core/auth.service';

@Component({
  selector: 'app-users-page',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>Utilisateurs</h1></div>
    <p class="muted mb-2">Créez les comptes autorisés à accéder au site. Seuls les administrateurs peuvent modifier le contenu.</p>

    <form class="admin-form mb-2" (ngSubmit)="create()">
      <div class="form-grid">
        <div class="field"><label>Email</label><input class="input" type="email" name="email" [(ngModel)]="email" required autocomplete="off"></div>
        <div class="field"><label>Mot de passe (8+)</label><input class="input" type="text" name="password" [(ngModel)]="password" required minlength="8" autocomplete="off"></div>
        <div class="field"><label>Rôle</label><label class="checkbox-row"><input type="checkbox" name="isAdmin" [(ngModel)]="isAdmin"> Administrateur</label></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="busy()">{{ busy() ? 'Création…' : 'Créer le compte' }}</button></div>
      @if (message()) { <p class="tag" [class.tag-ok]="ok()" [class.tag-todo]="!ok()">{{ message() }}</p> }
    </form>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Email</th><th>Créé</th><th>Dernière connexion</th><th>Rôle</th><th></th></tr></thead>
        <tbody>
          @for (u of users(); track u.id) {
            <tr>
              <td>{{ u.email }}</td>
              <td class="text-sm">{{ u.created_at | date: 'dd/MM/yyyy' }}</td>
              <td class="text-sm">{{ u.last_sign_in_at ? (u.last_sign_in_at | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
              <td>@if (u.is_admin) { <span class="tag tag-ok">Admin</span> } @else { <span class="tag">Membre</span> }</td>
              <td><div class="row-actions">
                <button class="icon-action" (click)="toggleAdmin(u)" [title]="u.is_admin ? 'Retirer le rôle admin' : 'Promouvoir administrateur'">{{ u.is_admin ? '↓' : '↑' }}</button>
                <button class="icon-action" (click)="remove(u)" title="Supprimer">✕</button>
              </div></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty-state">Aucun utilisateur.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; }
    .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }
    .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
  `],
})
export class UsersPage {
  private readonly auth = inject(AuthService);

  readonly users = signal<Member[]>([]);
  email = '';
  password = '';
  isAdmin = false;
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  readonly ok = signal(false);

  constructor() { void this.load(); }

  private async load(): Promise<void> {
    try { this.users.set(await this.auth.listUsers()); }
    catch (e) { this.flash(e instanceof Error ? e.message : 'Erreur', false); }
  }

  async create(): Promise<void> {
    this.busy.set(true);
    this.message.set(null);
    try {
      await this.auth.createUser(this.email, this.password, this.isAdmin);
      this.flash('Compte créé ✓', true);
      this.email = '';
      this.password = '';
      this.isAdmin = false;
      await this.load();
    } catch (e) {
      this.flash(e instanceof Error ? e.message : 'Erreur', false);
    } finally {
      this.busy.set(false);
    }
  }

  async toggleAdmin(u: Member): Promise<void> {
    try { await this.auth.setAdmin(u.id, !u.is_admin); await this.load(); }
    catch (e) { this.flash(e instanceof Error ? e.message : 'Erreur', false); }
  }

  async remove(u: Member): Promise<void> {
    if (!confirm(`Supprimer le compte ${u.email} ?`)) return;
    try { await this.auth.deleteUser(u.id); await this.load(); }
    catch (e) { this.flash(e instanceof Error ? e.message : 'Erreur', false); }
  }

  private flash(text: string, ok: boolean): void {
    this.message.set(text);
    this.ok.set(ok);
  }
}
