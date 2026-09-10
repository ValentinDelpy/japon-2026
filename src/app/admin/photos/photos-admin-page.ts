import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { getSupabase } from '../../core/supabase';
import { storageUrl } from '../../core/config';
import { Photo } from '../../core/models';

@Component({
  selector: 'app-photos-admin-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>🖼️ Photos</h1></div>

    <form class="admin-form mb-2" (ngSubmit)="upload()">
      <div class="form-grid">
        <div class="field"><label>Fichier</label><input class="input" type="file" accept="image/*" (change)="onFile($event)"></div>
        <div class="field"><label>Titre</label><input class="input" name="title" [(ngModel)]="title"></div>
        <div class="field"><label>Lieu</label><input class="input" name="location" [(ngModel)]="location"></div>
        <div class="field"><label>Catégorie</label><input class="input" name="category" [(ngModel)]="category"></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="!file || busy()">{{ busy() ? 'Envoi…' : 'Envoyer' }}</button></div>
      @if (message()) { <p class="tag" [class.tag-ok]="ok()" [class.tag-todo]="!ok()">{{ message() }}</p> }
    </form>

    <div class="photos-masonry">
      @for (p of photos; track p.id) {
        <div class="photo-item">
          <img class="photo-img loaded" [src]="url(p)" [alt]="p.title || ''">
          <button class="photo-del" (click)="remove(p)" title="Supprimer">🗑️</button>
        </div>
      } @empty { <p class="empty-state">Aucune photo.</p> }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; }
    .admin-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; }
    .photo-del { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,.55); color: #fff; border: none; border-radius: 8px; padding: 4px 8px; cursor: pointer; }
  `],
})
export class PhotosAdminPage {
  readonly admin = inject(AdminService);
  private readonly content = inject(ContentService);

  readonly photos = this.content.content().photos;
  file: File | null = null;
  title = '';
  location = '';
  category = '';
  readonly busy = signal(false);
  readonly message = signal<string | null>(null);
  readonly ok = signal(false);
  private readonly base = storageUrl();

  url(p: Photo): string { return `${this.base}${p.storage_path}`; }
  onFile(e: Event): void { this.file = (e.target as HTMLInputElement).files?.[0] ?? null; }

  async upload(): Promise<void> {
    const sb = getSupabase();
    if (!sb || !this.file) return;
    this.busy.set(true);
    this.message.set(null);
    try {
      const path = `${Date.now()}-${this.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await sb.storage.from('photos').upload(path, this.file, { upsert: false });
      if (error) throw error;
      await this.admin.save('photos', {
        trip_id: this.content.trip()?.id, storage_path: path,
        title: this.title || null, location: this.location || null, category: this.category || null,
        order_index: this.photos.length,
      });
      this.ok.set(true); this.message.set('Photo ajoutée ✓');
      this.file = null; this.title = this.location = this.category = '';
    } catch (e) {
      this.ok.set(false); this.message.set(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.busy.set(false);
    }
  }

  async remove(p: Photo): Promise<void> {
    const sb = getSupabase();
    if (!sb || !p.id) return;
    if (!confirm('Supprimer cette photo ?')) return;
    await sb.storage.from('photos').remove([p.storage_path]);
    await this.admin.remove('photos', p.id);
  }
}
