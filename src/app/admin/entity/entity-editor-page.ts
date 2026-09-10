import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { ContentService } from '../../core/content.service';
import { ENTITIES, EntityConfig } from './entity-config';

@Component({
  selector: 'app-entity-editor-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (config; as cfg) {
      <div class="admin-page-header"><h1>{{ cfg.icon }} {{ cfg.title }}</h1><span class="spacer"></span><button class="btn btn-primary btn-sm" (click)="add()">+ Nouveau</button></div>
      @if (!admin.enabled) { <div class="notice">Mode démo : les modifications ne sont pas enregistrées.</div> }

      @if (formOpen()) {
        <form class="admin-form mb-2" (ngSubmit)="save()">
          <div class="form-grid">
            @for (f of cfg.fields; track f.key) {
              <div class="field" [style.grid-column]="(f.type === 'textarea' || f.full) ? '1 / -1' : null">
                <label>{{ f.label }}</label>
                @switch (f.type) {
                  @case ('textarea') { <textarea class="textarea" [name]="f.key" [(ngModel)]="draft[f.key]"></textarea> }
                  @case ('number') { <input class="input" type="number" [name]="f.key" [(ngModel)]="draft[f.key]"> }
                  @case ('date') { <input class="input" type="date" [name]="f.key" [(ngModel)]="draft[f.key]"> }
                  @case ('select') {
                    <select class="select" [name]="f.key" [(ngModel)]="draft[f.key]">
                      @for (o of f.options ?? []; track o) { <option [ngValue]="o">{{ o || '—' }}</option> }
                    </select>
                  }
                  @case ('ref') {
                    <select class="select" [name]="f.key" [(ngModel)]="draft[f.key]">
                      <option [ngValue]="null">—</option>
                      @for (o of f.optionsFrom ? f.optionsFrom(content.content()) : []; track o.value) { <option [ngValue]="o.value">{{ o.label }}</option> }
                    </select>
                  }
                  @case ('checkbox') {
                    <label class="checkbox-row"><input type="checkbox" [name]="f.key" [(ngModel)]="draft[f.key]"> Oui</label>
                  }
                  @default { <input class="input" [name]="f.key" [(ngModel)]="draft[f.key]"> }
                }
              </div>
            }
          </div>
          <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="formOpen.set(false)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
        </form>
      }

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr>@for (col of cfg.columns; track col.key) { <th>{{ col.label }}</th> }<th></th></tr></thead>
          <tbody>
            @for (row of rows(); track row['id']) {
              <tr>
                @for (col of cfg.columns; track col.key) { <td>{{ row[col.key] }}</td> }
                <td><div class="row-actions">
                  <button class="icon-action" (click)="edit(row)" title="Modifier">✏️</button>
                  <button class="icon-action" (click)="remove(row)" title="Supprimer">🗑️</button>
                </div></td>
              </tr>
            } @empty { <tr><td [attr.colspan]="cfg.columns.length + 1" class="empty-state">Aucun élément.</td></tr> }
          </tbody>
        </table>
      </div>
    } @else {
      <div class="empty-state">Collection inconnue.</div>
    }
  `,
  styles: [`
    :host { display: block; }
    .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; }
    .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; }
    .admin-table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: auto; }
    .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
  `],
})
export class EntityEditorPage {
  readonly admin = inject(AdminService);
  readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);

  readonly config: EntityConfig | undefined = ENTITIES[this.route.snapshot.data['entity']];
  readonly formOpen = signal(false);
  draft: Record<string, any> = {};
  private editingId: string | undefined;

  readonly rows = computed(() => (this.config ? this.config.rows(this.content.content()) : []));

  add(): void {
    this.draft = { ...(this.config?.defaults ?? {}), trip_id: this.content.trip()?.id, order_index: this.rows().length };
    this.editingId = undefined;
    this.formOpen.set(true);
  }

  edit(row: Record<string, any>): void {
    this.draft = { ...row };
    for (const f of this.config?.fields ?? []) {
      if (f.array && Array.isArray(this.draft[f.key])) this.draft[f.key] = this.draft[f.key].join('\n');
    }
    this.editingId = row['id'];
    this.formOpen.set(true);
  }

  async save(): Promise<void> {
    if (!this.config) return;
    const payload: Record<string, any> = { ...this.draft, id: this.editingId, trip_id: this.content.trip()?.id };
    for (const f of this.config.fields) {
      if (f.array && typeof payload[f.key] === 'string') payload[f.key] = payload[f.key].split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    await this.admin.save(this.config.table, payload);
    this.formOpen.set(false);
  }

  async remove(row: Record<string, any>): Promise<void> {
    if (!this.config || !row['id']) return;
    if (confirm('Supprimer cet élément ?')) await this.admin.remove(this.config.table, row['id'] as string);
  }
}
