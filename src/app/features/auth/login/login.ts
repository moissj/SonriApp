import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, mapAuthError } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, AlertComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Este campo es obligatorio.';
    if (ctrl.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (ctrl.hasError('minlength')) return 'La contraseña debe tener mínimo 6 caracteres.';
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
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email!, password!);
    } catch (err: unknown) {
      this.serverError.set(mapAuthError(err as Error));
    } finally {
      this.loading.set(false);
    }
  }
}
