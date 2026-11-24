import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Opciones de parentesco reutilizadas en Responsable, Acompañante y Remite (DRY) */
export const PARENTESCO_OPCIONES = [
  'Madre',
  'Padre',
  'Hermano/a',
  'Cónyuge',
  'Hijo/a',
  'Tutor legal',
  'Otro',
] as const;

/**
 * Selector de parentesco reutilizable. Cuando el usuario elige "Otro"
 * muestra un campo de texto y el valor emitido es el texto libre digitado.
 * Implementa ControlValueAccessor para integrarse con formularios reactivos.
 */
@Component({
  selector: 'app-parentesco-select',
  standalone: true,
  templateUrl: './parentesco-select.html',
  styleUrl: './parentesco-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParentescoSelectComponent),
      multi: true,
    },
  ],
})
export class ParentescoSelectComponent implements ControlValueAccessor {
  @Input({ required: true }) id!: string;
  @Input() label = 'Parentesco';
  @Input() error = '';

  readonly opciones = PARENTESCO_OPCIONES;

  /** Opción elegida en el select ('Otro' habilita el campo de texto) */
  readonly seleccion = signal<string>('');
  /** Texto libre cuando la selección es "Otro" */
  readonly otroTexto = signal<string>('');
  readonly isDisabled = signal(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get esOtro(): boolean {
    return this.seleccion() === 'Otro';
  }

  writeValue(value: string): void {
    const val = value ?? '';
    if (!val) {
      this.seleccion.set('');
      this.otroTexto.set('');
      return;
    }
    if ((PARENTESCO_OPCIONES as readonly string[]).includes(val) && val !== 'Otro') {
      this.seleccion.set(val);
      this.otroTexto.set('');
    } else {
      // Valor personalizado guardado previamente
      this.seleccion.set('Otro');
      this.otroTexto.set(val);
    }
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  onSelectChange(value: string): void {
    this.seleccion.set(value);
    if (value === 'Otro') {
      this.onChange(this.otroTexto().trim());
    } else {
      this.onChange(value);
    }
    this.onTouched();
  }

  onOtroChange(value: string): void {
    this.otroTexto.set(value);
    this.onChange(value.trim());
  }

  onBlur(): void {
    this.onTouched();
  }
}
