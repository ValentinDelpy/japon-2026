import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';

@Component({
  selector: 'app-packing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Packing List <span class="jp-accent">荷造り</span></h1><p class="subtitle">Tout ce qu'il faut préparer avant de partir.</p></div>

    <div class="packing-progress-bar-wrap">
      <div class="packing-prog-header"><span class="packing-prog-label">Progression</span><span class="packing-prog-value">{{ checked() }} / {{ total() }} ({{ pct() }}%)</span></div>
      <div class="packing-prog-track"><div class="packing-prog-fill" [style.width.%]="pct()"></div></div>
    </div>

    <div class="packing-grid">
      @for (cat of categories; track cat.id ?? cat.label) {
        <div class="packing-cat" [class.packing-cat-done]="catDone(cat)">
          <div class="packing-cat-header"><span class="packing-cat-icon">{{ cat.icon }}</span><span class="packing-cat-label">{{ cat.label }}</span><span class="packing-cat-count">{{ doneIn(cat) }}/{{ cat.items.length }}</span></div>
          <ul class="packing-items">
            @for (item of cat.items; track item.id ?? item.label) {
              <li class="packing-item" [class.packing-done]="checkedFor(item.id)" [class.packing-required]="item.required" (click)="toggle(item.id)">
                <span class="packing-checkbox">{{ checkedFor(item.id) ? '✅' : '☐' }}</span>
                <span class="packing-item-label">{{ item.label }}</span>
                @if (item.required && !checkedFor(item.id)) { <span class="packing-req-badge">!</span> }
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class PackingPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressStore);
  readonly categories = this.content.content().packingCategories;
  private readonly state = this.progress.state('packing');

  readonly total = computed(() => this.categories.reduce((s, c) => s + c.items.length, 0));
  readonly checked = computed(() => {
    const s = this.state();
    return this.categories.reduce((sum, c) => sum + c.items.filter((i) => i.id && s[i.id]).length, 0);
  });
  readonly pct = computed(() => (this.total() ? Math.round((this.checked() / this.total()) * 100) : 0));

  checkedFor(id?: string): boolean { return !!(id && this.state()[id]); }
  doneIn(cat: { items: { id?: string }[] }): number { const s = this.state(); return cat.items.filter((i) => i.id && s[i.id]).length; }
  catDone(cat: { items: { id?: string }[] }): boolean { return cat.items.length > 0 && this.doneIn(cat) === cat.items.length; }
  toggle(id?: string): void { if (id) this.progress.toggle('packing', id); }
}
