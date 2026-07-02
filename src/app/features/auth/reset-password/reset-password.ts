import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, mapAuthError } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, AlertComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly done = signal(false);

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    { validators: [this.matchValidator] }
  );

  private matchValidator(group: AbstractControl): Record<string, boolean> | null {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  }

  fieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return 'Este campo es obligatorio.';
    if (ctrl.hasError('minlength')) return 'La contraseña debe tener mínimo 6 caracteres.';
    if (field === 'confirm' && this.form.hasError('mismatch') && ctrl.value) {
      return 'Las contraseñas no coinciden.';
    }
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
      await this.auth.updatePassword(this.form.getRawValue().password!);
      this.done.set(true);
    } catch (err: unknown) {
      this.serverError.set(mapAuthError(err as Error));
    } finally {
      this.loading.set(false);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
