import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, mapAuthError } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, AlertComponent],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly emailSent = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailError(): string {
    const ctrl = this.form.get('email');
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'El correo electrónico es obligatorio.';
    if (ctrl.hasError('email')) return 'Ingresa un correo electrónico válido.';
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.serverError.set('');
    try {
      await this.auth.recoverPassword(this.form.getRawValue().email!);
      this.emailSent.set(true);
    } catch (err: unknown) {
      this.serverError.set(mapAuthError(err as Error));
    } finally {
      this.loading.set(false);
    }
  }
}
