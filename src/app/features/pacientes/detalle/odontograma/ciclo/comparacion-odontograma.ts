import { Component, ChangeDetectionStrategy, inject, input, signal, viewChild } from '@angular/core';
import { OdontogramaService, OdontogramaTipo } from '../../../../../core/services/odontograma.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { agruparMarcasPorPieza } from '../../../../../core/funciones/marcas-odontograma.funcion';
import { dientesConCambios, EstadoOdontograma } from '../funciones/comparar-odontograma.funcion';
import { calcularIndices, IndiceCeo, IndiceCop } from '../funciones/indice-cop.funcion';

interface Resumen { cambios: string[]; inicial: { cop: IndiceCop; ceo: IndiceCeo }; final: { cop: IndiceCop; ceo: IndiceCeo } }

/** Comparación inicial vs final: dientes con cambios + índices COP/ceo (resumen textual, sin SVG lado a lado). */
@Component({
  selector: 'app-comparacion-odontograma',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" [class]="btn" (click)="abrir()">Comparar inicial vs final</button>
    <app-modal #modal title="Inicial vs final">
      <div class="space-y-3 text-sm text-gray-700" aria-live="polite">
        @if (cargando()) { <p>Cargando…</p> }
        @else if (error()) { <p class="text-red-700 font-semibold" role="alert">{{ error() }}</p> }
        @else if (resumen(); as r) {
          <section aria-labelledby="cmp-cambios">
            <h4 id="cmp-cambios" class="text-xs font-semibold uppercase text-gray-500">Dientes con cambios ({{ r.cambios.length }})</h4>
            <p>{{ r.cambios.length ? r.cambios.join(', ') : 'Sin diferencias entre inicial y final.' }}</p>
          </section>
          @for (f of filas(r); track f.titulo) {
            <section [attr.aria-label]="'Índices ' + f.titulo">
              <h4 class="text-xs font-semibold uppercase text-gray-500">{{ f.titulo }}</h4>
              <p>COP (permanentes): C {{ f.i.cop.C }} · O {{ f.i.cop.O }} · P {{ f.i.cop.P }} · total {{ f.i.cop.total }}</p>
              <p>ceo (temporales): c {{ f.i.ceo.c }} · e {{ f.i.ceo.e }} · o {{ f.i.ceo.o }} · total {{ f.i.ceo.total }}</p>
            </section>
          }
        }
        <div class="flex justify-end"><button type="button" [class]="btn" (click)="modal.close()">Cerrar</button></div>
      </div>
    </app-modal>
  `,
})
export class ComparacionOdontogramaComponent {
  private readonly svc = inject(OdontogramaService);
  readonly pacienteId = input.required<string>();
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly resumen = signal<Resumen | null>(null);
  private readonly modal = viewChild.required<ModalComponent>('modal');

  readonly btn = 'h-7 px-3 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40';
  filas = (r: Resumen) => [{ titulo: 'Inicial', i: r.inicial }, { titulo: 'Final', i: r.final }];

  async abrir(): Promise<void> {
    this.modal().open();
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [a, b] = await Promise.all([this.estado('inicial'), this.estado('final')]);
      this.resumen.set({ cambios: dientesConCambios(a, b), inicial: calcularIndices(a), final: calcularIndices(b) });
    } catch {
      this.resumen.set(null);
      this.error.set('No se pudo cargar la comparación.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async estado(tipo: OdontogramaTipo): Promise<EstadoOdontograma> {
    const id = this.pacienteId();
    const [sup, marcas] = await Promise.all([this.svc.getOdontograma(id, tipo), this.svc.getMarcas(id, tipo)]);
    return { superficies: sup, marcas: agruparMarcasPorPieza(marcas) };
  }
}
