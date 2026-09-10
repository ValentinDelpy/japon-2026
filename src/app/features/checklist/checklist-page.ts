import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';

@Component({
  selector: 'app-checklist-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Check-list départ <span class="jp-accent">出発準備</span></h1><p class="subtitle">Les tâches à accomplir avant le départ.</p></div>

    <div class="packing-progress-bar-wrap">
      <div class="packing-prog-header"><span class="packing-prog-label">Tâches accomplies</span><span class="packing-prog-value">{{ checked() }} / {{ total() }} ({{ pct() }}%)</span></div>
      <div class="packing-prog-track"><div class="packing-prog-fill" style="background:linear-gradient(90deg,var(--sage),var(--sky))" [style.width.%]="pct()"></div></div>
    </div>

    <div class="checklist-phases">
      @for (phase of phases; track phase.id ?? phase.label) {
        <div class="cl-phase" [class.cl-phase-done]="doneIn(phase) === phase.tasks.length">
          <div class="cl-phase-header" [style.border-left]="'3px solid ' + (phase.color || 'var(--accent)')">
            <span class="cl-phase-icon">{{ phase.icon }}</span><span class="cl-phase-label">{{ phase.label }}</span>
            <span class="cl-phase-count">{{ doneIn(phase) }}/{{ phase.tasks.length }}</span>
          </div>
          <ul class="cl-tasks">
            @for (task of phase.tasks; track task.id ?? task.label) {
              <li class="cl-task" [class.cl-done]="checkedFor(task.id)" (click)="toggle(task.id)">
                <span class="packing-checkbox">{{ checkedFor(task.id) ? '✅' : '☐' }}</span>
                <span class="cl-task-label">{{ task.label }} @if (task.link) { <a class="cl-link" [href]="task.link" target="_blank" (click)="$event.stopPropagation()">↗</a> }</span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class ChecklistPage {
  private readonly content = inject(ContentService);
  private readonly progress = inject(ProgressStore);
  readonly phases = this.content.content().checklistPhases;
  private readonly state = this.progress.state('checklist');

  readonly total = computed(() => this.phases.reduce((s, p) => s + p.tasks.length, 0));
  readonly checked = computed(() => { const s = this.state(); return this.phases.reduce((sum, p) => sum + p.tasks.filter((t) => t.id && s[t.id]).length, 0); });
  readonly pct = computed(() => (this.total() ? Math.round((this.checked() / this.total()) * 100) : 0));

  checkedFor(id?: string): boolean { return !!(id && this.state()[id]); }
  doneIn(phase: { tasks: { id?: string }[] }): number { const s = this.state(); return phase.tasks.filter((t) => t.id && s[t.id]).length; }
  toggle(id?: string): void { if (id) this.progress.toggle('checklist', id); }
}
