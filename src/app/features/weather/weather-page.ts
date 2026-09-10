import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';

@Component({
  selector: 'app-weather-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Météo & Saison <span class="jp-accent">気候と季節</span></h1><p class="subtitle">À quoi s'attendre en novembre–décembre.</p></div>

    <div class="meteo-banner">
      <div class="meteo-banner-emoji">🍁</div>
      <div class="meteo-banner-body">
        <div class="meteo-banner-title">Saison du koyo</div>
        <div class="meteo-banner-text">Votre voyage tombe pendant la saison des érables rouges (紅葉). Températures fraîches, foules modérées.</div>
      </div>
    </div>

    <div class="meteo-grid">
      @for (m of weather; track m.id ?? m.city) {
        <div class="meteo-card">
          <div class="meteo-card-header"><span class="meteo-city-icon">{{ m.icon || '🌤️' }}</span><div><div class="meteo-city-name">{{ m.city }}</div><div class="meteo-city-jp">{{ m.city_jp }}</div></div></div>
          <div class="meteo-stats">
            @if (m.low != null && m.high != null) { <div class="meteo-stat"><span class="meteo-stat-icon">🌡️</span><span class="meteo-stat-val">{{ m.low }}–{{ m.high }}°C</span></div> }
            @if (m.rain != null) { <div class="meteo-stat"><span class="meteo-stat-icon">☔</span><span class="meteo-stat-val">~{{ m.rain }} j/mois</span></div> }
          </div>
          @if (m.koyo) { <div class="meteo-koyo"><span class="meteo-koyo-icon">🍁</span>{{ m.koyo }}</div> }
          @if (m.tips.length) { <ul class="meteo-tips">@for (t of m.tips; track t) { <li>{{ t }}</li> }</ul> }
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class WeatherPage {
  private readonly content = inject(ContentService);
  readonly weather = this.content.content().weather;
}
