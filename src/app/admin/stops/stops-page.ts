import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { Accommodation, Stop } from '../../core/models';
import { formatRange } from '../../core/format';

@Component({
  selector: 'app-stops-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>📍 Étapes</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" (click)="add()">+ Nouvelle étape</button></div>
    @if (!admin.enabled) { <div class="notice">Mode démo : lecture seule.</div> }

    @if (editing(); as s) {
      <form class="admin-form mb-2" (ngSubmit)="save()">
        <div class="form-grid">
          <div class="field"><label>Ville</label><input class="input" name="city" [(ngModel)]="s.city" required></div>
          <div class="field"><label>Ville (JP)</label><input class="input" name="city_jp" [(ngModel)]="s.city_jp"></div>
          <div class="field"><label>Début</label><input class="input" type="date" name="start_date" [(ngModel)]="s.start_date"></div>
          <div class="field"><label>Fin</label><input class="input" type="date" name="end_date" [(ngModel)]="s.end_date"></div>
          <div class="field"><label>Nuits</label><input class="input" type="number" name="nights" [(ngModel)]="s.nights"></div>
        </div>
        <h3 style="margin:10px 0 8px;font-size:.9rem">Hébergement</h3>
        <div class="form-grid">
          <div class="field"><label>Nom</label><input class="input" name="acc_name" [(ngModel)]="acc.name"></div>
          <div class="field"><label>Alternative</label><input class="input" name="acc_alt" [(ngModel)]="acc.alt_name"></div>
          <div class="field"><label>Prix total (€)</label><input class="input" type="number" name="acc_price" [(ngModel)]="acc.price_total"></div>
          <div class="field"><label>Réservé</label><select class="select" name="acc_res" [(ngModel)]="acc.reserved"><option [ngValue]="true">Oui</option><option [ngValue]="false">Non</option></select></div>
        </div>
        <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>
    }

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Ville</th><th>Dates</th><th>Hébergement</th><th>Prix</th><th></th></tr></thead>
        <tbody>
          @for (stop of content.stops(); track stop.id) {
            <tr>
              <td><strong>{{ stop.city }}</strong></td>
              <td class="row-date">{{ formatRange(stop.start_date, stop.end_date) }}</td>
              <td>{{ accommodation(stop.id)?.name || '—' }}</td>
              <td>{{ accommodation(stop.id)?.price_total ?? '—' }}</td>
              <td><div class="row-actions">
                <button class="icon-action" (click)="edit(stop)" title="Modifier">✏️</button>
                <button class="icon-action" (click)="remove(stop)" title="Supprimer">🗑️</button>
              </div></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty-state">Aucune étape.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [':host { display: block; } .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; } .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; max-width: 820px; } .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }'],
})
export class StopsPage {
  readonly admin = inject(AdminService);
  readonly content = inject(ContentService);
  readonly formatRange = formatRange;
  readonly editing = signal<Partial<Stop> | null>(null);
  readonly acc: Partial<Accommodation> = {};
  private accId: string | undefined;

  accommodation(stopId?: string | null): Accommodation | null { return this.content.accommodationForStop(stopId); }
  add(): void { this.editing.set({ nights: 1, order_index: this.content.stops().length }); Object.keys(this.acc).forEach((k) => delete (this.acc as any)[k]); this.accId = undefined; }

  edit(stop: Stop): void {
    this.editing.set({ ...stop });
    const a = this.accommodation(stop.id);
    Object.keys(this.acc).forEach((k) => delete (this.acc as any)[k]);
    if (a) Object.assign(this.acc, a);
    this.accId = a?.id;
  }

  async save(): Promise<void> {
    const s = this.editing();
    if (!s?.city) return;
    const tripId = this.content.trip()?.id;
    await this.admin.save('stops', { ...s, trip_id: tripId });
    if (this.acc.name && s.id) {
      await this.admin.save('accommodations', { ...this.acc, id: this.accId, stop_id: s.id, trip_id: tripId });
    }
    this.editing.set(null);
  }

  async remove(stop: Stop): Promise<void> {
    if (stop.id && confirm(`Supprimer l'étape ${stop.city} ?`)) await this.admin.remove('stops', stop.id);
  }
}
