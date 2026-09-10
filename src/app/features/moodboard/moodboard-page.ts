import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-moodboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Moodboard <span class="jp-accent">インスピレーション</span></h1><p class="subtitle">L'ambiance du voyage en images.</p></div>

    <div class="mood-grid">
      @for (section of sections; track section.id ?? section.city) {
        <div class="mood-section">
          <div class="mood-section-header" [style.border-left]="'3px solid ' + (section.color || 'var(--accent)')">
            <span class="mood-section-city">{{ section.city }}</span><span class="mood-section-jp">{{ section.name_jp }}</span>
          </div>
          <div class="mood-images">
            @for (img of section.images; track img.id ?? img.url) {
              <div class="mood-img-wrap" (click)="lightbox.set(img)">
                <img class="mood-img" [src]="img.url" [alt]="img.alt || section.city" loading="lazy">
                @if (img.caption) { <div class="mood-img-caption">{{ img.caption }}</div> }
              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (lightbox(); as img) {
      <div class="mood-lightbox" (click)="lightbox.set(null)">
        <button class="mood-lb-close" (click)="lightbox.set(null)">×</button>
        <img class="mood-lb-img" [src]="img.url" [alt]="img.alt || ''">
        @if (img.caption) { <div class="mood-lb-caption">{{ img.caption }}</div> }
      </div>
    }
  `,
  styles: [':host { display: block; }'],
})
export class MoodboardPage {
  private readonly content = inject(ContentService);
  readonly sections = this.content.content().moodboardSections;
  readonly lightbox = signal<{ url: string; alt?: string | null; caption?: string | null } | null>(null);
}
