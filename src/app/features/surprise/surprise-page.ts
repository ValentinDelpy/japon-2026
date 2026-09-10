import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { SurpriseItem } from '../../core/models';

@Component({
  selector: 'app-surprise-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Surprise ! <span class="jp-accent">サプライズ</span></h1><p class="subtitle">Laissez le hasard choisir votre prochaine idée.</p></div>

    <div class="surprise-controls">
      <div class="surprise-filter-group">
        <label class="surprise-label">Ville</label>
        <select class="surprise-select" [value]="city()" (change)="onCity($event)">
          <option value="all">Toutes les villes</option>
          @for (c of cities(); track c) { <option [value]="c">{{ c }}</option> }
        </select>
      </div>
      <div class="surprise-filter-group">
        <label class="surprise-label">Type</label>
        <select class="surprise-select" [value]="type()" (change)="onType($event)">
          <option value="all">Tout</option>
          <option value="restaurant">🍜 Restaurant</option>
          <option value="highlight">⭐ À ne pas manquer</option>
        </select>
      </div>
    </div>

    <div class="surprise-stage">
      <button class="surprise-btn" (click)="spin()"><span class="surprise-btn-dice">🎲</span><span>Lancer le dé !</span></button>
      @if (pick(); as p) {
        <div class="surprise-result">
          <div class="surprise-card" style="border-top:4px solid var(--accent)">
            <div class="surprise-card-meta">
              <span class="surprise-type-badge" style="background:var(--accent-l);color:var(--accent)">{{ p.icon }} {{ p.type === 'restaurant' ? 'Restaurant' : 'À ne pas manquer' }}</span>
              <span class="surprise-city">{{ p.city }}</span>
            </div>
            <div class="surprise-card-text">{{ p.text }}</div>
            @if (p.price) { <div class="surprise-card-price">💴 {{ p.price }}</div> }
            <button class="surprise-again-btn" (click)="spin()">↻ Une autre</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class SurprisePage {
  private readonly content = inject(ContentService);
  readonly city = signal('all');
  readonly type = signal('all');
  readonly pick = signal<SurpriseItem | null>(null);

  readonly cities = computed(() => [...new Set(this.content.content().surpriseItems.map((i) => i.city).filter((c): c is string => !!c))]);
  private readonly pool = computed(() => this.content.content().surpriseItems.filter((i) => (this.city() === 'all' || i.city === this.city()) && (this.type() === 'all' || i.type === this.type())));

  onCity(e: Event): void { this.city.set((e.target as HTMLSelectElement).value); }
  onType(e: Event): void { this.type.set((e.target as HTMLSelectElement).value); }
  spin(): void { const p = this.pool(); if (p.length) this.pick.set(p[Math.floor(Math.random() * p.length)]); }
}
