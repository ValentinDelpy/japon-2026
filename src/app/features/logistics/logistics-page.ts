import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-logistics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Logistique Japon <span class="jp-accent">実用情報</span></h1><p class="subtitle">L'essentiel pour voyager sereinement.</p></div>
    <div class="logistique-grid">
      @for (s of sections; track s.id ?? s.title) {
        <div class="logistique-card">
          <div class="logistique-card-header" [style.border-left]="'4px solid ' + (s.color || 'var(--accent)')"><span class="logistique-icon">{{ s.icon }}</span><span class="logistique-title">{{ s.title }}</span></div>
          <ul class="logistique-list">
            @for (item of s.items; track item.id ?? item.text) { <li [innerHTML]="item.text"></li> }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class LogisticsPage {
  private readonly content = inject(ContentService);
  readonly sections = this.content.content().logisticsSections;
}
