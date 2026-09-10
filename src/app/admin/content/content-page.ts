import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-content-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page-header"><h1>📝 Contenu éditorial</h1><span class="spacer"></span><button class="btn btn-secondary btn-sm" (click)="exportJson()">⬇ Exporter (sauvegarde)</button></div>
    <p class="muted mb-2">Contenu actuellement chargé depuis la base (lecture). L'édition fine de chaque collection est branchée sur les mêmes tables.</p>

    <div class="admin-cards">
      @for (c of cards(); track c.label) {
        <div class="admin-card"><span>{{ c.icon }}</span><strong>{{ c.label }}</strong><small>{{ c.count }} entrée(s)</small></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .admin-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .admin-card { display: flex; flex-direction: column; gap: 3px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); }
    .admin-card span { font-size: 1.4rem; }
    .admin-card small { color: var(--ink3); }
  `],
})
export class ContentPage {
  private readonly content = inject(ContentService);

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.content.content(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `little-domo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  readonly cards = computed(() => {
    const c = this.content.content();
    return [
      { icon: '🏙️', label: 'Destinations', count: c.destinations.length },
      { icon: '🍜', label: 'Restaurants', count: c.restaurants.length },
      { icon: '🛍️', label: 'Souvenirs', count: c.souvenirs.length },
      { icon: '🎒', label: 'Packing', count: c.packingCategories.reduce((s, x) => s + x.items.length, 0) },
      { icon: '✅', label: 'Check-list', count: c.checklistPhases.reduce((s, x) => s + x.tasks.length, 0) },
      { icon: '🗣️', label: 'Phrases', count: c.phrases.length },
      { icon: '🎌', label: 'Événements', count: c.culturalEvents.length },
      { icon: '📸', label: 'Moodboard', count: c.moodboardSections.reduce((s, x) => s + x.images.length, 0) },
      { icon: '🌤️', label: 'Météo', count: c.weather.length },
      { icon: '🇯🇵', label: 'Japon 101', count: c.japan101Sections.reduce((s, x) => s + x.items.length, 0) },
      { icon: '🚉', label: 'Logistique', count: c.logisticsSections.reduce((s, x) => s + x.items.length, 0) },
      { icon: '🎲', label: 'Surprise', count: c.surpriseItems.length },
    ];
  });
}
