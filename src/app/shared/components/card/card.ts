import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  /** Espaciado interno del cuerpo */
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  /** Nivel de sombra */
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'sm';
  /** Borde sutil alrededor de la tarjeta */
  @Input() bordered = true;

  get wrapperClass(): string {
    const shadow: Record<string, string> = {
      none: '',
      sm:   'shadow-card',
      md:   'shadow-card-md',
      lg:   'shadow-card-lg',
    };
    const parts = [
      'bg-white rounded-2xl overflow-hidden',
      shadow[this.shadow],
      this.bordered ? 'border border-gray-100' : '',
    ];
    return parts.filter(Boolean).join(' ');
  }

  get bodyClass(): string {
    const map: Record<string, string> = {
      none: '',
      sm:   'p-3 sm:p-4',
      md:   'p-4 sm:p-5',
      lg:   'p-5 sm:p-6',
    };
    return map[this.padding];
  }
}
