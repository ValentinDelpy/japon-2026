import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { ContentService } from '../../core/content.service';
import { EditModeService } from '../../core/edit-mode.service';
import { Activity } from '../../core/models';
import { buildHomeChapters, HomeChapter } from '../../core/home-data';
import { euro, formatRange } from '../../core/format';
import { InlineEdit } from '../../shared/inline-edit';

@Component({
  selector: 'app-home-carnet-page',
  imports: [FormsModule, InlineEdit],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (trip(); as t) {
      <section class="home-hero">
        @if (heroSrc(); as src) {
          <img class="home-hero-img" [src]="src" [attr.srcset]="heroSrcset()" sizes="100vw" alt="" fetchpriority="high" decoding="async">
        }
        <div class="home-hero-inner">
          <div class="home-eyebrow">Carnet de voyage · {{ t.subtitle }}</div>
          <h1>{{ t.origin }} <span>→</span> {{ t.destination }}</h1>
          <div class="home-hero-meta">
            <span>{{ heroDates() }}</span><span>{{ chapters().length }} bases</span><span>{{ nights() }} nuits</span><span>{{ t.travelers }} personnes</span>
          </div>
        </div>
      </section>

      <main class="home-journal">
        <section class="home-prologue" aria-label="Le voyage en chiffres">
          <div><span class="k">{{ chapters().length }}</span><span class="l">bases</span></div>
          <div><span class="k">{{ nights() }}</span><span class="l">nuits</span></div>
          <div><span class="k">{{ euro(budget()) }}</span><span class="l">logements</span></div>
          <div><span class="k">{{ restaurants() }}</span><span class="l">restos</span></div>
        </section>

        @for (c of chapters(); track c.stop.id ?? c.stop.city; let i = $index) {
          <article class="home-chapter">
            <aside class="home-chapter-side">
              <div class="home-num">{{ (i + 1).toString().padStart(2, '0') }}</div>
              <div class="home-dates">{{ c.dates }}</div>
              <div class="home-nights">{{ c.nights }} nuit{{ c.nights > 1 ? 's' : '' }}</div>
            </aside>

            <div class="home-chapter-body">
              <div class="home-kicker">Chapitre {{ i + 1 }}</div>
              <h2>{{ c.stop.city }}</h2>

              @if (c.dest) {
                <div class="home-intro">
                  <app-inline-edit [value]="c.dest.intro ?? ''" [multiline]="true" placeholder="Texte du chapitre" (valueChange)="stageDest(c, { intro: $event })">{{ c.dest.intro }}</app-inline-edit>
                </div>
              }

              @if (c.visited.length) {
                <div class="home-tags">@for (v of c.visited; track v) { <span>{{ v }}</span> }</div>
              }

              <div class="home-objects">
                <figure class="home-card">
                  <div class="home-photo" [style.background-image]="c.photo ? 'url(' + c.photo + ')' : null"></div>
                  @if (edit.active() && c.dest) {
                    <input class="inline-input" [ngModel]="c.dest.image_url ?? ''" (ngModelChange)="stageDest(c, { image_url: $event })" placeholder="URL de la photo du lieu" aria-label="URL de la photo du lieu">
                  }
                  <figcaption>
                    <div class="home-label">Logement</div>
                    <div class="home-name">
                      @if (c.acc) {
                        <app-inline-edit [value]="c.acc.name" placeholder="Nom du logement" (valueChange)="stageAcc(c, { name: $event })">{{ c.acc.name }}</app-inline-edit>
                      } @else {
                        <span class="muted">Aucun logement</span>
                      }
                    </div>
                    <div class="home-meta">
                      @if (c.acc?.price_total; as price) { <span>{{ euro(price) }}</span> } · {{ c.nights }} nuit{{ c.nights > 1 ? 's' : '' }}
                    </div>
                    @if (!edit.active()) {
                      @if (c.acc?.url) { <a class="home-link" [href]="c.acc?.url ?? ''" target="_blank" rel="noopener">Ouvrir l’annonce ↗</a> }
                      @if (c.acc?.alt_url) { <a class="home-link alt" [href]="c.acc?.alt_url ?? ''" target="_blank" rel="noopener">Alternative : {{ c.acc?.alt_name || 'voir' }} ↗</a> }
                      @if (c.guide) { <a class="home-link alt" [href]="c.guide" target="_blank" rel="noopener">Guide de la ville ↗</a> }
                    } @else {
                      @if (c.acc) {
                        <input class="inline-input" [ngModel]="c.acc.url ?? ''" (ngModelChange)="stageAcc(c, { url: $event })" placeholder="Lien du logement" aria-label="Lien du logement">
                        <input class="inline-input" [ngModel]="c.acc.alt_url ?? ''" (ngModelChange)="stageAcc(c, { alt_url: $event })" placeholder="Lien de l’alternative" aria-label="Lien de l’alternative">
                        <input class="inline-input" [ngModel]="c.acc.price_total ?? ''" (ngModelChange)="stagePrice(c, $event)" placeholder="Prix total (€)" aria-label="Prix total (€)">
                      }
                      @if (c.dest) {
                        <input class="inline-input" [ngModel]="c.dest.guide_url ?? ''" (ngModelChange)="stageDest(c, { guide_url: $event })" placeholder="Guide de la ville (URL)" aria-label="Guide de la ville (URL)">
                      }
                    }
                  </figcaption>
                </figure>

                @if (c.excursion; as e) {
                  <figure class="home-card">
                    <div class="home-photo" [style.background-image]="'url(' + e.photo + ')'"></div>
                    <figcaption>
                      <div class="home-label">Excursion</div>
                      <div class="home-name">{{ e.name }}</div>
                      @if (e.guide) { <a class="home-link" [href]="e.guide" target="_blank" rel="noopener">Guide ↗</a> }
                    </figcaption>
                  </figure>
                }
              </div>

              @if (c.activities.length || edit.active()) {
                <div class="home-acts">
                  <div class="home-label">Activités</div>
                  <ul>
                    @for (a of c.activities; track a.id) {
                      <li>
                        @if (edit.active()) {
                          <app-inline-edit [value]="a.title" placeholder="Activité" (valueChange)="stageAct(a, { title: $event })">{{ a.title }}</app-inline-edit>
                          <input class="inline-input" [ngModel]="a.link ?? ''" (ngModelChange)="stageActLink(a, $event)" placeholder="Lien (optionnel)" aria-label="Lien de l’activité">
                        } @else if (a.link) {
                          <a [href]="a.link" target="_blank" rel="noopener">{{ a.title }} ↗</a>
                        } @else {
                          {{ a.title }}
                        }
                      </li>
                    }
                  </ul>

                  @if (edit.active()) {
                    @if (addFor() === (c.stop.id ?? c.stop.city)) {
                      <div class="activity-add">
                        <input class="inline-input" [ngModel]="addTitle()" (ngModelChange)="addTitle.set($event)" placeholder="Titre de la nouvelle activité" aria-label="Titre de la nouvelle activité">
                        <input class="inline-input" [ngModel]="addLink()" (ngModelChange)="addLink.set($event)" placeholder="Lien (optionnel)" aria-label="Lien de la nouvelle activité">
                        <div class="activity-add-actions">
                          <button type="button" class="edit-cancel" (click)="addFor.set(null)">Annuler</button>
                          <button type="button" class="edit-save" (click)="addActivity(c)">Ajouter</button>
                        </div>
                      </div>
                    } @else {
                      <button type="button" class="activity-add-btn" (click)="startAdd(c)">+ Ajouter une activité</button>
                    }
                  }
                </div>
              }
            </div>
          </article>
        }
      </main>
    }
  `,
})
export class HomeCarnetPage {
  readonly content = inject(ContentService);
  readonly edit = inject(EditModeService);
  private readonly admin = inject(AdminService);
  readonly trip = this.content.trip;
  readonly euro = euro;
  readonly addFor = signal<string | null>(null);
  readonly addTitle = signal('');
  readonly addLink = signal('');

  readonly chapters = computed<HomeChapter[]>(() => buildHomeChapters(this.content.content()));

  readonly nights = computed(() => this.chapters().reduce((n, c) => n + c.nights, 0));
  readonly budget = computed(() => this.content.content().accommodations.reduce((n, a) => n + (a.price_total ?? 0), 0));
  readonly restaurants = computed(() => this.content.restaurants().length);
  readonly heroPhoto = computed(() => this.chapters().find((c) => c.photo)?.photo ?? null);
  readonly heroSrc = computed(() => {
    const url = this.heroPhoto();
    if (!url) return null;
    return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, '$1w=2000') : url;
  });
  readonly heroSrcset = computed(() => {
    const url = this.heroPhoto();
    if (!url || !/[?&]w=\d+/.test(url)) return null;
    const at = (w: number) => url.replace(/([?&])w=\d+/, `$1w=${w}`);
    return [1200, 2000, 3200, 3840].map((w) => `${at(w)} ${w}w`).join(', ');
  });
  readonly heroDates = computed(() => formatRange(this.trip()?.start_date, this.trip()?.end_date));

  stageDest(c: HomeChapter, patch: Record<string, unknown>): void { this.edit.stage('destinations', c.dest?.id, patch); }
  stageAcc(c: HomeChapter, patch: Record<string, unknown>): void { this.edit.stage('accommodations', c.acc?.id, patch); }
  stageAct(a: Activity, patch: Record<string, unknown>): void { this.edit.stage('activities', a.id, patch); }
  stageActLink(a: Activity, value: string): void { this.edit.stage('activities', a.id, { link: value.trim() || null }); }

  startAdd(c: HomeChapter): void {
    this.addFor.set(c.stop.id ?? c.stop.city);
    this.addTitle.set('');
    this.addLink.set('');
  }

  async addActivity(c: HomeChapter): Promise<void> {
    const title = this.addTitle().trim();
    const tripId = this.content.trip()?.id;
    if (!title || !c.firstDayId || !tripId) return;
    const order = c.activities.reduce((m, a) => Math.max(m, a.order_index), -1) + 1;
    try {
      await this.admin.save('activities', {
        trip_id: tripId,
        day_id: c.firstDayId,
        stop_id: c.stop.id ?? null,
        title,
        link: this.addLink().trim() || null,
        order_index: order,
      });
      this.addFor.set(null);
      this.addTitle.set('');
      this.addLink.set('');
    } catch (e) {
      this.edit.error.set(e instanceof Error ? e.message : String(e));
    }
  }

  stagePrice(c: HomeChapter, value: string): void {
    const n = value.trim() === '' ? null : Number(value);
    this.stageAcc(c, { price_total: n !== null && Number.isFinite(n) ? n : null });
  }
}
