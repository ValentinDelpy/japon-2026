import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { ContentService } from '../../core/content.service';
import { NESTED, NestedConfig } from './nested-config';

@Component({
  selector: 'app-nested-editor-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (config; as cfg) {
      <div class="admin-page-header">
        <h1>{{ cfg.icon }} {{ cfg.title }}</h1><span class="spacer"></span>
        <button class="btn btn-primary btn-sm" (click)="addParent()">+ {{ cfg.parentSingular }}</button>
      </div>

      @if (parentOpen()) {
        <form class="admin-form mb-2" (ngSubmit)="saveParent()">
          <div class="form-grid">
            @for (f of cfg.parentFields; track f.key) {
              <div class="field" [style.grid-column]="f.full ? '1 / -1' : null">
                <label>{{ f.label }}</label>
                @switch (f.type) {
                  @case ('checkbox') { <label class="checkbox-row"><input type="checkbox" [name]="'p_'+f.key" [(ngModel)]="parentDraft[f.key]"> Oui</label> }
                  @case ('number') { <input class="input" type="number" [name]="'p_'+f.key" [(ngModel)]="parentDraft[f.key]"> }
                  @default { <input class="input" [name]="'p_'+f.key" [(ngModel)]="parentDraft[f.key]"> }
                }
              </div>
            }
          </div>
          <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="parentOpen.set(false)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
        </form>
      }

      @for (group of rows(); track group.parent.id) {
        <section class="nested-parent">
          <header class="nested-head">
            <strong>{{ label(group.parent) }}</strong>
            <span class="spacer"></span>
            <button class="icon-action" (click)="editParent(group.parent)" title="Modifier">âœï¸</button>
            <button class="icon-action" (click)="removeParent(group.parent)" title="Supprimer">ðŸ—‘ï¸</button>
          </header>

          <table class="admin-table">
            <thead><tr>@for (col of cfg.childColumns; track col.key) { <th>{{ col.label }}</th> }<th></th></tr></thead>
            <tbody>
              @for (child of group.children; track child.id) {
                <tr>
                  @for (col of cfg.childColumns; track col.key) { <td>{{ child[col.key] }}</td> }
                  <td><div class="row-actions">
                    <button class="icon-action" (click)="editChild(group.parent, child)">âœï¸</button>
                    <button class="icon-action" (click)="removeChild(child)">ðŸ—‘ï¸</button>
                  </div></td>
                </tr>
              } @empty { <tr><td [attr.colspan]="cfg.childColumns.length + 1" class="muted" style="padding:10px">Aucun Ã©lÃ©ment.</td></tr> }
            </tbody>
          </table>

          @if (childOpen() && childParentId() === group.parent.id) {
            <form class="admin-form nested-child-form" (ngSubmit)="saveChild()">
              <div class="form-grid">
                @for (f of cfg.childFields; track f.key) {
                  <div class="field" [style.grid-column]="(f.type === 'textarea' || f.full) ? '1 / -1' : null">
                    <label>{{ f.label }}</label>
                    @switch (f.type) {
                      @case ('textarea') { <textarea class="textarea" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]"></textarea> }
                      @case ('number') { <input class="input" type="number" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]"> }
                      @case ('date') { <input class="input" type="date" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]"> }
                      @case ('select') { <select class="select" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]">@for (o of f.options ?? []; track o) { <option [ngValue]="o">{{ o || 'â€”' }}</option> }</select> }
                      @case ('checkbox') { <label class="checkbox-row"><input type="checkbox" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]"> Oui</label> }
                      @default { <input class="input" [name]="'c_'+f.key" [(ngModel)]="childDraft[f.key]"> }
                    }
                  </div>
                }
              </div>
              <div class="form-actions"><button class="btn btn-ghost" type="button" (click)="childOpen.set(false)">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div>
            </form>
          } @else {
            <button class="btn btn-ghost btn-sm nested-add" (click)="addChild(group.parent)">+ {{ cfg.childSingular }}</button>
          }
        </section>
      } @empty {
        <div class="empty-state">Aucun Ã©lÃ©ment. CrÃ©ez une premiÃ¨re {{ cfg.parentSingular }}.</div>
      }
    } @else {
      <div class="empty-state">Collection inconnue.</div>
    }
  `,
  styles: [`
    :host { display: block; }
    .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; }
    .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; }
    .nested-parent { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); margin-bottom: 14px; overflow: hidden; }
    .nested-head { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: var(--surface2); border-bottom: 1px solid var(--border); }
    .nested-head strong { font-family: 'Shippori Mincho', serif; }
    .nested-child-form { border-radius: 0; border: none; border-top: 1px solid var(--border); }
    .nested-add { margin: 10px 16px; }
    .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
  `],
})
export class NestedEditorPage {
  readonly admin = inject(AdminService);
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);

  readonly config: NestedConfig | undefined = NESTED[this.route.snapshot.data['nested']];
  readonly rows = computed(() => (this.config ? this.config.rows(this.content.content()) : []));

  readonly parentOpen = signal(false);
  readonly childOpen = signal(false);
  readonly childParentId = signal<string | null>(null);
  parentDraft: Record<string, any> = {};
  childDraft: Record<string, any> = {};
  private parentId: string | undefined;
  private childId: string | undefined;

  label(parent: any): string {
    const col = this.config?.parentColumns[0]?.key ?? 'id';
    return String(parent[col] ?? 'â€”');
  }

  addParent(): void {
    this.parentDraft = { ...(this.config?.parentDefaults ?? {}), trip_id: this.content.trip()?.id, order_index: this.rows().length };
    this.parentId = undefined;
    this.parentOpen.set(true);
  }
  editParent(parent: any): void { this.parentDraft = { ...parent }; this.parentId = parent.id; this.parentOpen.set(true); }

  async saveParent(): Promise<void> {
    if (!this.config) return;
    await this.admin.save(this.config.parentTable, { ...this.parentDraft, id: this.parentId, trip_id: this.content.trip()?.id });
    this.parentOpen.set(false);
  }
  async removeParent(parent: any): Promise<void> {
    if (!this.config || !parent.id) return;
    if (confirm('Supprimer cet Ã©lÃ©ment et son contenu ?')) await this.admin.remove(this.config.parentTable, parent.id);
  }

  addChild(parent: any): void {
    this.childDraft = { ...(this.config?.childDefaults ?? {}), [this.config!.fk]: parent.id, order_index: 0 };
    this.childId = undefined;
    this.childParentId.set(parent.id);
    this.childOpen.set(true);
  }
  editChild(parent: any, child: any): void {
    this.childDraft = { ...child };
    this.childId = child.id;
    this.childParentId.set(parent.id);
    this.childOpen.set(true);
  }
  async saveChild(): Promise<void> {
    if (!this.config) return;
    await this.admin.save(this.config.childTable, { ...this.childDraft, id: this.childId });
    this.childOpen.set(false);
  }
  async removeChild(child: any): Promise<void> {
    if (!this.config || !child.id) return;
    if (confirm('Supprimer cet Ã©lÃ©ment ?')) await this.admin.remove(this.config.childTable, child.id);
  }
}
