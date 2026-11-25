import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Encabezado de página: título, subtítulo y slot `[acciones]`. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="min-w-0">
        <h1 class="text-xl font-semibold text-slate-900">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="text-sm text-slate-500 mt-0.5">{{ subtitulo() }}</p>
        }
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <ng-content select="[acciones]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>('');
}
