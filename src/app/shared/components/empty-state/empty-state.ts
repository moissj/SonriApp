import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  /** Nombre del icono Lucide (kebab-case) que representa el estado vacío */
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
      sm: 'w-10 h-10 mb-3',
      md: 'w-12 h-12 sm:w-14 sm:h-14 mb-4',
      lg: 'w-14 h-14 sm:w-16 sm:h-16 mb-5',
    };
    return `block text-gray-400 ${size[this.size]}`;
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
