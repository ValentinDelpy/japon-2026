import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-phrasebook-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Phrasebook <span class="jp-accent">会話帳</span></h1><p class="subtitle">Japonais de survie.</p></div>

    <div class="phrase-search-bar">
      <input class="phrase-search-input" placeholder="Rechercher une phrase…" [value]="query()" (input)="onQuery($event)">
      <div class="phrase-cats">
        <button class="phrase-cat-btn" [class.active]="cat() === 'all'" (click)="cat.set('all')">Tout</button>
        @for (c of categories(); track c.name) { <button class="phrase-cat-btn" [class.active]="cat() === c.name" (click)="cat.set(c.name)">{{ c.icon }} {{ c.name }}</button> }
      </div>
    </div>

    @for (c of categories(); track c.name) {
      @if (cat() === 'all' || cat() === c.name) {
        @if (filtered(c.name).length) {
          <div class="phrase-section">
            <div class="phrase-section-title">{{ c.icon }} {{ c.name }}</div>
            <div class="phrases-grid">
              @for (p of filtered(c.name); track p.id ?? p.fr) {
                <div class="phrase-card">
                  <div class="phrase-fr">{{ p.fr }}</div>
                  <div class="phrase-jp">{{ p.jp }}</div>
                  <div class="phrase-rom">{{ p.romaji }}</div>
                  @if (p.pronunciation) { <div class="phrase-pron">🔊 {{ p.pronunciation }}</div> }
                </div>
              }
            </div>
          </div>
        }
      }
    }
  `,
  styles: [':host { display: block; }'],
})
export class PhrasebookPage {
  private readonly content = inject(ContentService);
  readonly query = signal('');
  readonly cat = signal('all');

  readonly categories = computed(() => {
    const map = new Map<string, string>();
    for (const p of this.content.content().phrases) map.set(p.category, p.category_icon || '');
    return [...map.entries()].map(([name, icon]) => ({ name, icon }));
  });

  filtered(category: string) {
    const q = this.query().toLowerCase();
    return this.content.content().phrases.filter((p) => p.category === category && (!q || p.fr.toLowerCase().includes(q) || (p.romaji || '').toLowerCase().includes(q)));
  }

  onQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }
}
