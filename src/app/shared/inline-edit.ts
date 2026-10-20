import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditModeService } from '../core/edit-mode.service';

/** Affiche le contenu projeté, ou un champ éditable en mode admin. */
@Component({
  selector: 'app-inline-edit',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (edit.active()) {
      @if (multiline) {
        <textarea class="inline-input inline-textarea" [ngModel]="value" (ngModelChange)="valueChange.emit($event)" [placeholder]="placeholder" [attr.aria-label]="placeholder || 'Modifier le contenu'"></textarea>
      } @else {
        <input class="inline-input" [ngModel]="value" (ngModelChange)="valueChange.emit($event)" [placeholder]="placeholder" [attr.aria-label]="placeholder || 'Modifier le contenu'">
      }
    } @else {
      <ng-content />
    }
  `,
  styles: [':host { display: inline; }'],
})
export class InlineEdit {
  readonly edit = inject(EditModeService);
  @Input() value: string | number | null | undefined = '';
  @Input() multiline = false;
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter<string>();
}
