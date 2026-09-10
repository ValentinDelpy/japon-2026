import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-japan-101-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Japon 101 <span class="jp-accent">日本の常識</span></h1><p class="subtitle">Tout ce qu'il faut savoir pour voyager au Japon.</p></div>

    <div class="j101-grid">
      @for (section of sections; track section.id ?? section.title) {
        <div class="j101-section">
          <div class="j101-section-header"><span class="j101-section-icon">{{ section.icon }}</span><span class="j101-section-title">{{ section.title }}</span></div>
          <div class="j101-items">
            @for (item of section.items; track item.id ?? item.question) {
              <div class="j101-item" [class.j101-open]="isOpen(item.id)" (click)="toggle(item.id)">
                <div class="j101-q"><span class="j101-q-text">{{ item.question }}</span><span class="j101-chevron">{{ isOpen(item.id) ? '▲' : '▼' }}</span></div>
                @if (isOpen(item.id)) { <div class="j101-a"><div class="j101-a-inner" [innerHTML]="item.answer"></div></div> }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .j101-a { max-height: none; }
  `],
})
export class Japan101Page {
  private readonly content = inject(ContentService);
  readonly sections = this.content.content().japan101Sections;
  readonly openIds = signal<Record<string, boolean>>({});
  isOpen(id?: string): boolean { return !!id && !!this.openIds()[id]; }
  toggle(id?: string): void { if (id) this.openIds.set({ ...this.openIds(), [id]: !this.openIds()[id] }); }
}
