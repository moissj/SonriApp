import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input({ required: true }) id!: string;
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  @Input() error = '';
  @Input() hint = '';

  readonly value = signal('');
  readonly isDisabled = signal(false);
  readonly showPassword = signal(false);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get inputType(): string {
    return this.type === 'password' ? (this.showPassword() ? 'text' : 'password') : this.type;
  }

  get inputClass(): string {
    const base =
      'w-full rounded-lg border px-2.5 py-1.5 min-h-9 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2';
    const stateClass = this.error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50'
      : 'border-gray-300 focus:border-sky-500 focus:ring-sky-200 bg-white';
    const disabledClass = this.isDisabled() ? 'opacity-50 cursor-not-allowed' : '';
    const paddingRight = this.type === 'password' ? 'pr-11' : '';
    return [base, stateClass, disabledClass, paddingRight].filter(Boolean).join(' ');
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
