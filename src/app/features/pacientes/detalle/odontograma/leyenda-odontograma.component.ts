import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { GrupoLeyenda } from './funciones/catalogo-hallazgos';

/**
 * Leyenda estilo papel: grupos en grilla 4/2/1 columnas. Glifo + texto siempre (el color no es la única señal).
 * Encapsulation None: sus estilos (swatch, tk-*, estado-*) también los usan la toolbar y el modal del odontograma.
 */
@Component({
  selector: 'app-leyenda-odontograma',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './leyenda-odontograma.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Leyenda del odontograma" class="space-y-2.5 break-inside-avoid rounded-2xl border border-slate-200 bg-slate-50 p-3.5 print:border-0 print:bg-transparent print:p-0">
      <h4 class="text-xxs font-bold uppercase tracking-wide text-slate-400 print:hidden">Convenciones</h4>
      @for (g of grupos(); track g.titulo) {
        <div>
          <h4 class="text-xxs font-bold text-slate-500 uppercase tracking-wide mb-1">{{ g.titulo }}</h4>
          <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-x-4 gap-y-1">
            @for (i of g.items; track i.h.id) {
              <li class="flex items-center gap-1.5 text-xs text-gray-700">
                @if (i.h.estadoEnum) { <span aria-hidden="true" [attr.class]="'swatch estado-' + i.h.estadoEnum"></span> }
                @if (i.glifo) { <span aria-hidden="true" [attr.class]="'w-5 text-center font-bold tk-' + i.h.token">{{ i.glifo }}</span> }
                <span>{{ i.h.label }}</span>
              </li>
            }
          </ul>
        </div>
      }
    </section>
  `,
})
export class LeyendaOdontogramaComponent {
  readonly grupos = input.required<GrupoLeyenda[]>();
}
