import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ChecklistMode = 'si-no' | 'normal-alterado';

export interface ChecklistItemValue {
  valor: string | null;
  observacion: string;
}

@Component({
  selector: 'app-checklist-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './checklist-item.html',
  styleUrl: './checklist-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistItemComponent {
  /** Etiqueta visible del ítem */
  readonly nombre = input.required<string>();

  /** Modo: 'si-no' (defecto) o 'normal-alterado' */
  readonly mode = input<ChecklistMode>('si-no');

  /** Valor seleccionado: 'si'|'no'|'normal'|'alterado'|null */
  readonly valor = model<string | null>(null);

  /** Texto libre de observación */
  readonly observacion = model<string>('');

  get opciones(): { label: string; value: string }[] {
    return this.mode() === 'si-no'
      ? [
          { label: 'S', value: 'si' },
          { label: 'N', value: 'no' },
        ]
      : [
          { label: 'N', value: 'normal' },
          { label: 'A', value: 'alterado' },
        ];
  }

  selectValor(v: string): void {
    this.valor.set(this.valor() === v ? null : v);
  }
}
