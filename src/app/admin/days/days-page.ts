import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { Day } from '../../core/models';
import { formatDay } from '../../core/format';

@Component({
  selector: 'app-days-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>📅 Journées</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" (click)="add()">+ Nouvelle journée</button></div>

    @if (error(); as e) { <div class="notice">{{ e }}</div> }

    @if (editing(); as d) {
      <form class="admin-form mb-2" (ngSubmit)="save()">
        <div class="form-grid">
          <div class="field"><label>Date</label><input class="input" type="date" name="date" [(ngModel)]="d.date" required></div>
          <div class="field"><label>Base (logement)</label><select class="select" name="base_stop_id" [(ngModel)]="d.base_stop_id">
            <option [ngValue]="null">— Aucune —</option>
            @for (s of content.stops(); track s.id) { <option [ngValue]="s.id">{{ s.city }}</option> }
          </select></div>
          <div class="field"><label>Lieu visité</label><input class="input" name="visited_place" placeholder="Ville / quartier du jour" [(ngModel)]="d.visited_place"></div>
          <div class="field"><label>Titre</label><input class="input" name="title" [(ngModel)]="d.title"></div>
        </div>
        <div class="field"><label>Notes</label><textarea class="textarea" name="notes" [(ngModel)]="d.notes"></textarea></div>
        <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>
    }

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Date</th><th>Base</th><th>Visité</th><th>Activités</th><th></th></tr></thead>
        <tbody>
          @for (day of content.days(); track day.id) {
            <tr>
              <td class="row-date">{{ formatDay(day.date) }}</td>
              <td>{{ stopName(day.base_stop_id ?? day.stop_id) }}</td>
              <td>{{ day.visited_place || day.title || '—' }}</td>
              <td>{{ activityCount(day.id) }}</td>
              <td><div class="row-actions">
                <button class="icon-action" (click)="edit(day)" title="Modifier">✏️</button>
                <button class="icon-action" (click)="remove(day)" title="Supprimer">🗑️</button>
              </div></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty-state">Aucune journée.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [':host { display: block; } .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; } .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; max-width: 800px; } .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }'],
})
export class DaysPage {
  readonly admin = inject(AdminService);
  readonly content = inject(ContentService);
  readonly formatDay = formatDay;
  readonly editing = signal<Partial<Day> | null>(null);
  readonly error = signal<string | null>(null);

  stopName(id?: string | null): string { return this.content.stops().find((s) => s.id === id)?.city ?? '—'; }
  activityCount(id?: string): number { return this.content.content().activities.filter((a) => a.day_id === id).length; }
  add(): void { this.editing.set({ date: new Date().toISOString().slice(0, 10), base_stop_id: null, order_index: this.content.days().length }); }
  edit(day: Day): void { this.editing.set({ ...day, base_stop_id: day.base_stop_id ?? day.stop_id ?? null }); }

  async save(): Promise<void> {
    const d = this.editing();
    if (!d?.date) return;
    this.error.set(null);
    try {
      // stop_id reste un alias strict de base_stop_id (null si aucune base).
      await this.admin.save('days', { ...d, stop_id: d.base_stop_id ?? null, trip_id: this.content.trip()?.id });
      this.editing.set(null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }

  async remove(day: Day): Promise<void> {
    if (!day.id) return;
    const n = this.activityCount(day.id);
    const extra = n ? ` et ses ${n} activité(s)` : '';
    if (!confirm(`Supprimer la journée du ${formatDay(day.date)}${extra} ?`)) return;
    this.error.set(null);
    try { await this.admin.remove('days', day.id); }
    catch (e) { this.error.set(e instanceof Error ? e.message : String(e)); }
  }
}
