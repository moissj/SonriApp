import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export type KpiTono = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const CLASES_ICONO: Record<KpiTono, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
};

const CLASES_VALOR: Record<KpiTono, string> = {
  neutral: 'text-slate-900',
  primary: 'text-slate-900',
  success: 'text-slate-900',
  warning: 'text-slate-900',
  danger: 'text-red-700',
};

/** Tarjeta de indicador. Con `enlace` toda la tarjeta es un `<a routerLink>`. */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enlace(); as ruta) {
      <a [routerLink]="ruta" [class]="envoltura" [attr.title]="tooltip() || null">
        <ng-container *ngTemplateOutlet="cuerpo" />
      </a>
    } @else {
      <div [class]="envoltura" [attr.title]="tooltip() || null">
        <ng-container *ngTemplateOutlet="cuerpo" />
      </div>
    }

    <ng-template #cuerpo>
      <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
        @if (icono()) {
          <span [class]="'inline-flex h-8 w-8 items-center justify-center rounded-lg ' + claseIcono()">
            <lucide-icon [name]="icono()!" class="h-4 w-4" aria-hidden="true" />
          </span>
        }
        <span class="truncate">{{ titulo() }}</span>
      </div>
      <p [class]="'mt-2 text-2xl font-bold break-words ' + claseValor()">{{ valor() }}</p>
      @if (delta() !== null || sparkline().length > 1) {
        <div class="mt-1 flex items-center justify-between gap-2 text-xs text-slate-600">
          @if (delta() !== null) {
            <span>{{ delta() }} @if (deltaLabel()) { <span>{{ deltaLabel() }}</span> }</span>
          }
          @if (puntos(); as p) {
            <svg viewBox="0 0 100 24" class="h-6 w-20 text-primary-600" aria-hidden="true">
              <polyline [attr.points]="p" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
          }
        </div>
      }
    </ng-template>
  `,
})
export class KpiCard {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly icono = input<string>();
  readonly tono = input<KpiTono>('neutral');
  readonly delta = input<string | null>(null);
  readonly deltaLabel = input<string>();
  readonly sparkline = input<number[]>([]);
  readonly tooltip = input<string>();
  readonly enlace = input<string>();

  protected readonly claseIcono = computed(() => CLASES_ICONO[this.tono()]);
  protected readonly claseValor = computed(() => CLASES_VALOR[this.tono()]);

  protected readonly puntos = computed(() => {
    const s = this.sparkline();
    if (s.length < 2) return '';
    const min = Math.min(...s);
    const rango = Math.max(...s) - min || 1;
    return s.map((v, i) => `${(i / (s.length - 1)) * 100},${22 - ((v - min) / rango) * 20}`).join(' ');
  });

  protected readonly envoltura =
    'block rounded-2xl border border-gray-100 bg-white p-4 shadow-card min-h-10 transition-shadow hover:shadow-card-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600';
}
