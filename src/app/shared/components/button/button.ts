import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() fullWidth = false;

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

    const variants: Record<string, string> = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500',
      secondary:
        'bg-white text-sky-700 border border-sky-300 hover:bg-sky-50 active:bg-sky-100 focus:ring-sky-400',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    };

    const sizes: Record<string, string> = {
      sm: 'text-sm px-4 py-2',
      md: 'text-base px-5 py-3',
      lg: 'text-base px-6 py-3.5',
    };

    return [base, variants[this.variant], sizes[this.size], this.fullWidth ? 'w-full' : '']
      .filter(Boolean)
      .join(' ');
  }
}
