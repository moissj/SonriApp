import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface OpcionSegmento<T> {
  label: string;
  value: T;
}

/** Selección única en formato pill. Uso: `<app-segmented-control [opciones]="o" [(valor)]="v" ariaLabel="..." />` */
@Component({
  selector: 'app-segmented-control',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="radiogroup" [attr.aria-label]="ariaLabel() || null" class="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5 gap-0.5">
      @for (op of opciones(); track op.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="op.value === valor()"
          [tabindex]="op.value === valor() ? 0 : -1"
          (click)="valor.set(op.value)"
          (keydown.arrowright)="mover(1, $event)"
          (keydown.arrowdown)="mover(1, $event)"
          (keydown.arrowleft)="mover(-1, $event)"
          (keydown.arrowup)="mover(-1, $event)"
          class="min-h-8 min-w-8 px-3 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          [class]="op.value === valor() ? 'bg-white shadow-sm text-primary-700 font-medium' : 'text-slate-600 hover:text-slate-900'"
        >{{ op.label }}</button>
      }
    </div>
  `,
})
export class SegmentedControlComponent<T extends string | number> {
  readonly opciones = input.required<OpcionSegmento<T>[]>();
  readonly valor = model<T | null>(null);
  readonly ariaLabel = input('');

  mover(delta: number, ev: Event): void {
    ev.preventDefault();
    const ops = this.opciones();
    const i = ops.findIndex((o) => o.value === this.valor());
    const sig = ops[(i + delta + ops.length) % ops.length];
    this.valor.set(sig.value);
    const grupo = (ev.currentTarget as HTMLElement).parentElement;
    // El foco sigue a la selección tras el re-render
    setTimeout(() => grupo?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
  }
}
