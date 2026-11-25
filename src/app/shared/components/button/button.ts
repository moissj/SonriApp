import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger';
type Tamano = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50',
  ghost: 'bg-transparent text-primary-700 hover:bg-slate-100',
  danger: 'bg-danger-600 hover:bg-danger-700 text-white',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3.5 py-1.5',
  lg: 'text-sm px-4 py-2',
};

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<Variante>('primary');
  readonly size = input<Tamano>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);

  readonly classes = computed(() =>
    [BASE, VARIANTES[this.variant()], TAMANOS[this.size()], this.fullWidth() ? 'w-full' : '']
      .filter(Boolean)
      .join(' '),
  );
}
