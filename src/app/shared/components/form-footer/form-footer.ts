import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-form-footer',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <app-button
        variant="secondary"
        type="button"
        [disabled]="saving()"
        (click)="cancelar.emit()"
      >
        {{ cancelLabel() }}
      </app-button>
      <app-button
        variant="primary"
        [type]="submitType()"
        [loading]="saving()"
        [disabled]="saving()"
      >
        {{ submitLabel() }}
      </app-button>
    </div>
  `,
})
export class FormFooterComponent {
  readonly saving = input(false);
  readonly submitLabel = input('Guardar');
  readonly cancelLabel = input('Cancelar');
  readonly submitType = input<'submit' | 'button'>('submit');
  readonly cancelar = output<void>();
}
