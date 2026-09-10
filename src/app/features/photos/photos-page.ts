import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { environment } from '../../../environments/environment';
import { Photo } from '../../core/models';

@Component({
  selector: 'app-photos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Photos <span class="jp-accent">写真</span></h1><p class="subtitle">Les souvenirs photo par destination.</p></div>

    @if (photos.length) {
      @for (group of groups(); track group.city) {
        <div class="photos-section">
          <div class="photos-section-header"><span class="photos-city">{{ group.city }}</span><span class="photos-count">{{ group.items.length }} photo{{ group.items.length > 1 ? 's' : '' }}</span></div>
          <div class="photos-masonry">
            @for (p of group.items; track p.id) {
              <div class="photo-item" (click)="lightbox.set(p)">
                <img class="photo-img" [src]="thumb(p)" [alt]="p.title || group.city" loading="lazy" (load)="$event.target && ($any($event.target).classList.add('loaded'))">
              </div>
            }
          </div>
        </div>
      }
    } @else {
      <div class="photos-empty">
        <div class="empty-icon">📷</div>
        <p>Aucune photo pour l'instant.</p>
        <p class="text-sm muted">Ajoutez-en depuis l'administration (stockage Supabase).</p>
      </div>
    }

    @if (lightbox(); as p) {
      <div class="photo-lightbox active" (click)="lightbox.set(null)">
        <button class="photo-lb-close" (click)="lightbox.set(null)">×</button>
        <div class="photo-lb-content"><img class="photo-lb-img" [src]="full(p)" [alt]="p.title || ''">
          <div class="photo-lb-caption"><span class="photo-lb-city">{{ p.location || p.category }}</span>@if (p.title) { <span class="photo-lb-name">{{ p.title }}</span> }</div>
        </div>
      </div>
    }
  `,
  styles: [':host { display: block; }'],
})
export class PhotosPage {
  private readonly content = inject(ContentService);
  readonly photos = this.content.content().photos;
  readonly lightbox = signal<Photo | null>(null);
  private readonly base = environment.supabaseUrl ? `${environment.supabaseUrl}/storage/v1/object/public/photos/` : '';

  readonly groups = computed(() => {
    const map = new Map<string, Photo[]>();
    for (const p of this.photos) { const k = p.location || p.category || 'Photos'; (map.get(k) ?? map.set(k, []).get(k)!).push(p); }
    return [...map.entries()].map(([city, items]) => ({ city, items }));
  });

  thumb(p: Photo): string { return `${this.base}${p.storage_path}?width=600`; }
  full(p: Photo): string { return `${this.base}${p.storage_path}`; }
}
