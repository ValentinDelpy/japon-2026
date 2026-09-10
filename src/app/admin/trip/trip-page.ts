import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../core/content.service';
import { AdminService } from '../../core/admin.service';
import { Trip } from '../../core/models';

@Component({
  selector: 'app-trip-page',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>âœˆï¸ Voyage</h1></div>

    <form class="admin-form" (ngSubmit)="save()">
      <div class="form-grid">
        <div class="field"><label>Nom</label><input class="input" name="title" [(ngModel)]="model.title"></div>
        <div class="field"><label>Sous-titre</label><input class="input" name="subtitle" [(ngModel)]="model.subtitle"></div>
        <div class="field"><label>Origine</label><input class="input" name="origin" [(ngModel)]="model.origin"></div>
        <div class="field"><label>Destination</label><input class="input" name="destination" [(ngModel)]="model.destination"></div>
        <div class="field"><label>DÃ©but</label><input class="input" type="date" name="start_date" [(ngModel)]="model.start_date"></div>
        <div class="field"><label>Fin</label><input class="input" type="date" name="end_date" [(ngModel)]="model.end_date"></div>
        <div class="field"><label>Voyageurs</label><input class="input" type="number" name="travelers" [(ngModel)]="model.travelers"></div>
        <div class="field"><label>Devise</label><input class="input" name="currency" [(ngModel)]="model.currency"></div>
      </div>
      <div class="field"><label>Description</label><textarea class="textarea" name="description" [(ngModel)]="model.description"></textarea></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrementâ€¦' : 'Enregistrer' }}</button></div>
      @if (message()) { <p class="tag tag-ok">{{ message() }}</p> }
    </form>
  `,
  styles: [':host { display: block; } .notice { background: var(--amber-l); color: var(--amber-dark); border-radius: 10px; padding: 10px 12px; font-size: .8rem; margin-bottom: 16px; } .admin-form { max-width: 760px; }'],
})
export class TripPage {
  readonly admin = inject(AdminService);
  private readonly content = inject(ContentService);
  readonly model: Partial<Trip> = {};
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  private seeded = false;

  constructor() {
    effect(() => {
      const t = this.content.trip();
      if (t && !this.seeded) { Object.assign(this.model, t); this.seeded = true; }
    });
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set(null);
    try {
      await this.admin.save('trips', { ...this.model, id: this.content.trip()?.id });
      this.message.set('EnregistrÃ© âœ“');
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.saving.set(false);
    }
  }
}
