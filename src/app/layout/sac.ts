import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SacItem { no: string; path: string; label: string; }

@Component({
  selector: 'app-sac',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="sac-overlay" (click)="close.emit()"></div>
      <aside class="sac-panel" role="dialog" aria-label="Outils du voyage">
        <header class="sac-head">
          <div><div class="sac-eyebrow">Tous les outils</div><h2>Le Sac</h2></div>
          <button type="button" class="sac-close" (click)="close.emit()">Fermer</button>
        </header>
        <nav class="sac-grid">
          @for (item of items; track item.path) {
            <a [routerLink]="item.path" (click)="close.emit()"><span>{{ item.no }}</span><strong>{{ item.label }}</strong></a>
          }
        </nav>
        <footer class="sac-foot">
          <button type="button" (click)="toggleTheme.emit()">Changer de thème</button>
          @if (isAdmin) { <a routerLink="/admin" (click)="close.emit()">Administration</a> }
          <button type="button" (click)="signOut.emit()">Se déconnecter</button>
        </footer>
      </aside>
    }
  `,
})
export class Sac {
  @Input() open = false;
  @Input() isAdmin = false;
  @Output() close = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();

  readonly items: SacItem[] = [
    { no: '01', path: '/carnet', label: 'Carnet' },
    { no: '02', path: '/atlas', label: 'Atlas' },
    { no: '03', path: '/today', label: "Aujourd'hui" },
    { no: '04', path: '/itinerary', label: 'Itinéraire' },
    { no: '05', path: '/timeline', label: 'Timeline' },
    { no: '06', path: '/sheets', label: 'Fiches voyage' },
    { no: '07', path: '/statistics', label: 'Statistiques' },
    { no: '08', path: '/packing', label: 'Packing list' },
    { no: '09', path: '/checklist', label: 'Check-list départ' },
    { no: '10', path: '/logistics', label: 'Logistique Japon' },
    { no: '11', path: '/restaurants', label: 'Restos & souvenirs' },
    { no: '12', path: '/discover', label: 'Découvrir' },
    { no: '13', path: '/phrasebook', label: 'Phrasebook' },
    { no: '14', path: '/culture', label: 'Agenda culturel' },
    { no: '15', path: '/moodboard', label: 'Moodboard' },
    { no: '16', path: '/photos', label: 'Photos' },
    { no: '17', path: '/weather', label: 'Météo & saison' },
    { no: '18', path: '/japan-101', label: 'Japon 101' },
    { no: '19', path: '/surprise', label: 'Surprise' },
    { no: '20', path: '/print', label: 'Impression' },
  ];
}
