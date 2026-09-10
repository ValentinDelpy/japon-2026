import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { Activity } from '../../core/models';
import { formatDay } from '../../core/format';

@Component({
  selector: 'app-activities-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>ðŸŽ¯ ActivitÃ©s</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" (click)="add()">+ Nouvelle activitÃ©</button></div>

    @if (editing(); as a) {
      <form class="admin-form mb-2" (ngSubmit)="save()">
        <div class="form-grid">
          <div class="field"><label>Titre</label><input class="input" name="title" [(ngModel)]="a.title" required></div>
          <div class="field"><label>JournÃ©e</label><select class="select" name="day_id" [(ngModel)]="a.day_id">
            <option [ngValue]="null">â€”</option>
            @for (d of content.days(); track d.id) { <option [ngValue]="d.id">{{ formatDay(d.date) }} â€” {{ stopName(d.stop_id) }}</option> }
          </select></div>
          <div class="field"><label>Heure</label><input class="input" name="time" placeholder="09:00" [(ngModel)]="a.time"></div>
          <div class="field"><label>CatÃ©gorie</label><input class="input" name="category" [(ngModel)]="a.category"></div>
          <div class="field"><label>DurÃ©e</label><input class="input" name="duration" [(ngModel)]="a.duration"></div>
          <div class="field"><label>CoÃ»t (Â¥)</label><input class="input" type="number" name="cost" [(ngModel)]="a.cost"></div>
        </div>
        <div class="field"><label>Description</label><textarea class="textarea" name="description" [(ngModel)]="a.description"></textarea></div>
        <div class="field"><label>Lien</label><input class="input" name="link" [(ngModel)]="a.link"></div>
        <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="editing.set(null)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
      </form>
    }

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Heure</th><th>Titre</th><th>JournÃ©e</th><th>CatÃ©gorie</th><th></th></tr></thead>
        <tbody>
          @for (a of sorted(); track a.id) {
            <tr>
              <td class="row-date">{{ a.time || 'â€”' }}</td>
              <td>{{ a.title }}</td>
              <td>{{ dayLabel(a.day_id) }}</td>
              <td>{{ a.category || 'â€”' }}</td>
              <td><div class="row-actions">
                <button class="icon-action" (click)="edit(a)" title="Modifier">âœï¸</button>
                <button class="icon-action" (click)="remove(a)" title="Supprimer">ðŸ—‘ï¸</button>
              </div></td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty-state">Aucune activitÃ©.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
  styles: [':host { display: block; } .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; } .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; max-width: 800px; } .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }'],
})
export class ActivitiesPage {
  readonly admin = inject(AdminService);
  readonly content = inject(ContentService);
  readonly formatDay = formatDay;
  readonly editing = signal<Partial<Activity> | null>(null);

  readonly sorted = () => [...this.content.activities()].sort((a, b) => a.order_index - b.order_index);
  stopName(id?: string | null): string { return this.content.stops().find((s) => s.id === id)?.city ?? ''; }
  dayLabel(id?: string | null): string { const d = this.content.days().find((x) => x.id === id); return d ? formatDay(d.date) : 'â€”'; }
  add(): void { this.editing.set({ order_index: this.content.activities().length }); }
  edit(a: Activity): void { this.editing.set({ ...a }); }

  async save(): Promise<void> {
    const a = this.editing();
    if (!a?.title) return;
    await this.admin.save('activities', { ...a, trip_id: this.content.trip()?.id });
    this.editing.set(null);
  }

  async remove(a: Activity): Promise<void> {
    if (a.id && confirm(`Supprimer Â« ${a.title} Â» ?`)) await this.admin.remove('activities', a.id);
  }
}
