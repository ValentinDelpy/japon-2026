import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { Reservation } from '../../core/models';

@Component({
  selector: 'app-reservations-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>🎫 Réservations</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" (click)="add()">+ Nouvelle réservation</button></div>

    @if (editing(); as r) {
      <form class="admin-form mb-2" (ngSubmit)="save()">
        <div class="form-grid">
          <div class="field"><label>Titre</label><input class="input" name="title" [(ngModel)]="r.title" required></div>
          <div class="field"><label>Type</label><select class="select" name="kind" [(ngModel)]="r.kind">
            <option value="hotel">Hôtel</option><option value="restaurant">Restaurant</option><option value="transport">Transport</option><option value="activity">Activité</option><option value="attraction">Attraction</option><option value="other">Autre</option>
          </select></div>
          <div class="field"><label>Date</label><input class="input" type="date" name="date" [(ngModel)]="r.date"></div>
          <div class="field"><label>Heure</label><input class="input" name="time" [(ngModel)]="r.time"></div>
          <div class="field"><label>Prix (€)</label><input class="input" type="number" name="price" [(ngModel)]="r.price"></div>
          <div class="field"><label>Statut</label><select class="select" name="status" [(ngModel)]="r.status">
            <option value="todo">À faire</option><option value="booked">Réservé</option><option value="cancelled">Annulé</option>
          </select></div>
          <div class="field"><label>Référence</label><input class="input" name="reference" [(ngModel)]="r.reference"></div>
          <div class="field"><label>Lien</label><input class="input" name="url" [(ngModel)]="r.url"></div>
        </div>
        <div class="field"><label>Notes</label><textarea class="textarea" name="notes" [(ngModel)]="r.notes"></textarea></div>
        <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>
    }

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Titre</th><th>Type</th><th>Date</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          @for (r of content.content().reservations; track r.id) {
            <tr>
              <td><strong>{{ r.title }}</strong></td>
              <td>{{ r.kind }}</td>
              <td class="row-date">{{ r.date || '—' }}</td>
              <td><span class="tag" [class.tag-ok]="r.status === 'booked'" [class.tag-todo]="r.status !== 'booked'">{{ r.status }}</span></td>
              <td><div class="row-actions">
                <button class="icon-action" (click)="edit(r)" title="Modifier">✏️</button>
                <button class="icon-action" (click)="remove(r)" title="Supprimer">🗑️</button>
              </div></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty-state">Aucune réservation.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [':host { display: block; } .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; } .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; max-width: 820px; } .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }'],
})
export class ReservationsPage {
  readonly admin = inject(AdminService);
  readonly content = inject(ContentService);
  readonly editing = signal<Partial<Reservation> | null>(null);

  add(): void { this.editing.set({ kind: 'other', status: 'todo', order_index: this.content.content().reservations.length }); }
  edit(r: Reservation): void { this.editing.set({ ...r }); }

  async save(): Promise<void> {
    const r = this.editing();
    if (!r?.title) return;
    await this.admin.save('reservations', { ...r, trip_id: this.content.trip()?.id });
    this.editing.set(null);
  }

  async remove(r: Reservation): Promise<void> {
    if (r.id && confirm(`Supprimer « ${r.title} » ?`)) await this.admin.remove('reservations', r.id);
  }
}
