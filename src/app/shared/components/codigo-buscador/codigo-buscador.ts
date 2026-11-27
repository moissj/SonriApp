import { Component, ChangeDetectionStrategy, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { CodigoClinico, etiquetaCodigo } from './funciones/etiqueta-codigo.funcion';

let seq = 0;

@Component({
  selector: 'app-codigo-buscador',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './codigo-buscador.html',
  styleUrl: './codigo-buscador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodigoBuscadorComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly label = input.required<string>();
  readonly placeholder = input<string>('Buscar por código o descripción...');
  readonly buscarFn = input.required<(q: string) => Promise<CodigoClinico[]>>();
  readonly valor = input<CodigoClinico | null>(null);
  readonly seleccion = output<CodigoClinico | null>();

  readonly inputId = `codigo-buscador-${++seq}`;
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly resultados = signal<CodigoClinico[]>([]);
  readonly seleccionado = signal<CodigoClinico | null>(null);
  readonly error = signal<string | null>(null);
  readonly etiqueta = etiquetaCodigo;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => from(this.buscar(term))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((r) => this.resultados.set(r));

    // Modo edición / reset externo: sincroniza el texto con el valor recibido
    effect(() => {
      const v = this.valor();
      this.seleccionado.set(v);
      this.searchControl.setValue(v ? etiquetaCodigo(v) : '', { emitEvent: false });
      this.resultados.set([]);
    });
  }

  private async buscar(term: string): Promise<CodigoClinico[]> {
    const sel = this.seleccionado();
    const q = term.trim();
    if (!q || (sel && term === etiquetaCodigo(sel))) return [];
    try {
      this.error.set(null);
      return await this.buscarFn()(q);
    } catch {
      this.error.set('No se pudo buscar en el catálogo. Intenta de nuevo.');
      return [];
    }
  }

  seleccionar(c: CodigoClinico): void {
    this.seleccionado.set(c);
    this.searchControl.setValue(etiquetaCodigo(c), { emitEvent: false });
    this.resultados.set([]);
    this.seleccion.emit(c);
  }

  limpiar(): void {
    this.seleccionado.set(null);
    this.resultados.set([]);
    this.error.set(null);
    this.searchControl.setValue('', { emitEvent: false });
    this.seleccion.emit(null);
  }
}
