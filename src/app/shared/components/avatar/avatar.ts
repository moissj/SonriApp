import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { iniciales } from './avatar.funcion';

const TAMANOS = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
} as const;

/** Avatar decorativo (foto o iniciales). El nombre accesible va en el texto contiguo. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (url(); as src) {
      <img [src]="src" alt="" aria-hidden="true" [class]="clases() + ' object-cover'" />
    } @else {
      <span [class]="clases() + ' bg-primary-100 text-primary-700 font-bold'" aria-hidden="true">{{ texto() }}</span>
    }
  `,
})
export class AvatarComponent {
  readonly nombre = input.required<string>();
  readonly url = input<string | null>(null);
  readonly tamano = input<'sm' | 'md' | 'lg'>('md');

  protected readonly texto = computed(() => iniciales(this.nombre()));
  protected readonly clases = computed(
    () => `inline-flex shrink-0 items-center justify-center rounded-full ${TAMANOS[this.tamano()]}`,
  );
}
