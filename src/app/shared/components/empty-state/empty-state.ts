import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  /** Emoji o carácter unicode que representa el estado vacío */
  @Input() icon = '';
  /** Título principal — requerido */
  @Input({ required: true }) title!: string;
  /** Descripción complementaria — opcional */
  @Input() subtitle = '';
  /** Tamaño general del componente */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get containerClass(): string {
    const py: Record<string, string> = { sm: 'py-8', md: 'py-12', lg: 'py-16' };
    return `flex flex-col items-center justify-center text-center px-4 ${py[this.size]}`;
  }

  get iconClass(): string {
    const size: Record<string, string> = {
      sm: 'text-4xl mb-3',
      md: 'text-5xl sm:text-6xl mb-4',
      lg: 'text-6xl sm:text-7xl mb-5',
    };
    return `block ${size[this.size]}`;
  }

  get titleClass(): string {
    const size: Record<string, string> = {
      sm: 'text-sm font-semibold text-dark',
      md: 'text-base sm:text-lg font-semibold text-dark',
      lg: 'text-lg sm:text-xl font-semibold text-dark',
    };
    return `mt-0 ${size[this.size]}`;
  }
}
