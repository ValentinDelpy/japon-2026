import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { PackingItem } from '../../core/models';

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
      @for (cat of categories(); track cat.id ?? cat.label) {
        <div class="packing-cat" [class.packing-cat-done]="catDone(cat)">
          <div class="packing-cat-header"><span class="packing-cat-icon">{{ cat.icon }}</span><span class="packing-cat-label">{{ cat.label }}</span><span class="packing-cat-count">{{ doneIn(cat) }}/{{ cat.items.length }}</span></div>
          <ul class="packing-items">
            @for (item of cat.items; track item.id ?? item.label) {
              <li class="packing-item" [class.packing-done]="item.checked" [class.packing-required]="item.required" (click)="toggle(item)">
                <span class="packing-checkbox">{{ item.checked ? '✅' : '☐' }}</span>
                <span class="packing-item-label">{{ item.label }}</span>
                @if (item.required && !item.checked) { <span class="packing-req-badge">!</span> }
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
  readonly categories = computed(() => this.content.content().packingCategories);

  readonly total = computed(() => this.categories().reduce((s, c) => s + c.items.length, 0));
  readonly checked = computed(() => this.categories().reduce((sum, c) => sum + c.items.filter((i) => i.checked).length, 0));
  readonly pct = computed(() => (this.total() ? Math.round((this.checked() / this.total()) * 100) : 0));

  doneIn(cat: { items: PackingItem[] }): number { return cat.items.filter((i) => i.checked).length; }
  catDone(cat: { items: PackingItem[] }): boolean { return cat.items.length > 0 && this.doneIn(cat) === cat.items.length; }

  toggle(item: PackingItem): void {
    if (!item.id) return;
    const value = !item.checked;
    this.content.update((c) => ({
      ...c,
      packingCategories: c.packingCategories.map((cat) => ({ ...cat, items: cat.items.map((i) => (i.id === item.id ? { ...i, checked: value } : i)) })),
    }));
    void this.content.persist('packing_items', item.id, { checked: value });
  }
}
