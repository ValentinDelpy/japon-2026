import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ChecklistTask } from '../../core/models';

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
      @for (phase of phases(); track phase.id ?? phase.label) {
        <div class="cl-phase" [class.cl-phase-done]="doneIn(phase) === phase.tasks.length">
          <div class="cl-phase-header" [style.border-left]="'3px solid ' + (phase.color || 'var(--accent)')">
            <span class="cl-phase-icon">{{ phase.icon }}</span><span class="cl-phase-label">{{ phase.label }}</span>
            <span class="cl-phase-count">{{ doneIn(phase) }}/{{ phase.tasks.length }}</span>
          </div>
          <ul class="cl-tasks">
            @for (task of phase.tasks; track task.id ?? task.label) {
              <li class="cl-task" [class.cl-done]="task.done" (click)="toggle(task)">
                <span class="packing-checkbox">{{ task.done ? '✅' : '☐' }}</span>
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
  readonly phases = computed(() => this.content.content().checklistPhases);

  readonly total = computed(() => this.phases().reduce((s, p) => s + p.tasks.length, 0));
  readonly checked = computed(() => this.phases().reduce((sum, p) => sum + p.tasks.filter((t) => t.done).length, 0));
  readonly pct = computed(() => (this.total() ? Math.round((this.checked() / this.total()) * 100) : 0));

  doneIn(phase: { tasks: ChecklistTask[] }): number { return phase.tasks.filter((t) => t.done).length; }

  toggle(task: ChecklistTask): void {
    if (!task.id) return;
    const value = !task.done;
    this.content.update((c) => ({
      ...c,
      checklistPhases: c.checklistPhases.map((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === task.id ? { ...t, done: value } : t)) })),
    }));
    void this.content.persist('checklist_tasks', task.id, { done: value });
  }
}
