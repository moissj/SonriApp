import {
  computed,
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ChecklistMode = 'si-no' | 'si-no-nosabe' | 'normal-alterado';

interface ChecklistOpcion {
  label: string;
  value: string;
  aria: string;
}

const SI: ChecklistOpcion = { label: 'S', value: 'si', aria: 'Sí' };
const NO: ChecklistOpcion = { label: 'N', value: 'no', aria: 'No' };
const OPCIONES_POR_MODO: Record<ChecklistMode, ChecklistOpcion[]> = {
  'si-no': [SI, NO],
  'si-no-nosabe': [SI, NO, { label: 'NS', value: 'no_sabe', aria: 'No sabe' }],
  'normal-alterado': [
    { label: 'N', value: 'normal', aria: 'Normal' },
    { label: 'A', value: 'alterado', aria: 'Alterado' },
  ],
};

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

  readonly opciones = computed<ChecklistOpcion[]>(() => OPCIONES_POR_MODO[this.mode()]);

  selectValor(v: string): void {
    this.valor.set(this.valor() === v ? null : v);
  }
}
