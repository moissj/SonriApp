import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { DEPARTAMENTOS_COLOMBIA, DURACIONES_CITA } from '../../shared/constants/colombia';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, AlertComponent],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);

  readonly currentStep = signal(1);
  readonly totalSteps = 3;
  readonly saving = signal(false);
  readonly serverError = signal('');
  readonly logoPreview = signal<string | null>(null);
  readonly departamentos = DEPARTAMENTOS_COLOMBIA;
  readonly duraciones = DURACIONES_CITA;

  private selectedLogoFile: File | null = null;

  // --- Paso 1: Datos del consultorio ---
  readonly step1Form = this.fb.group({
    telefono_contacto: ['', [Validators.required, Validators.pattern(/^\+57\s?\d{10}$/)]],
    ciudad: ['', Validators.required],
    departamento: ['', Validators.required],
  });

  // --- Paso 2: Horarios ---
  readonly step2Form = this.fb.group({
    horario_apertura: ['08:00', Validators.required],
    horario_cierre: ['18:00', Validators.required],
    duracion_cita_defecto: [30, Validators.required],
  });

  // --- Helpers de errores ---
  step1Error(field: string): string {
    const ctrl = this.step1Form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Este campo es obligatorio.';
    if (ctrl.hasError('minlength')) return 'Debe tener mínimo 3 caracteres.';
    if (ctrl.hasError('pattern')) return 'Formato inválido. Usa +57 seguido de 10 dígitos.';
    return '';
  }

  step2Error(field: string): string {
    const ctrl = this.step2Form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return '';
    if (ctrl.hasError('required')) return 'Este campo es obligatorio.';
    return '';
  }

  // --- Navegación del stepper ---
  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.step1Form.invalid) {
        this.step1Form.markAllAsTouched();
        return;
      }
    }
    if (this.currentStep() === 2) {
      if (this.step2Form.invalid) {
        this.step2Form.markAllAsTouched();
        return;
      }
    }
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  // --- Logo ---
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño (max 2MB)
    if (!file.type.startsWith('image/')) {
      this.serverError.set('El archivo debe ser una imagen (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.serverError.set('La imagen no debe superar 2 MB.');
      return;
    }

    this.selectedLogoFile = file;
    this.serverError.set('');

    // Preview
    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview.set(null);
  }

  // --- Guardar todo ---
  async onFinish(): Promise<void> {
    this.saving.set(true);
    this.serverError.set('');

    try {
      let logoUrl: string | null = null;

      // Subir logo si fue seleccionado
      if (this.selectedLogoFile) {
        logoUrl = await this.profileService.uploadLogo(this.selectedLogoFile);
      }

      // Combinar datos de los 3 pasos
      const step1 = this.step1Form.getRawValue();
      const step2 = this.step2Form.getRawValue();

      await this.profileService.updateProfile({
        telefono_contacto: step1.telefono_contacto!,
        ciudad: step1.ciudad!,
        departamento: step1.departamento!,
        horario_apertura: step2.horario_apertura!,
        horario_cierre: step2.horario_cierre!,
        duracion_cita_defecto: step2.duracion_cita_defecto!,
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      });

      await this.router.navigate(['/']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      this.serverError.set(`No se pudo guardar la configuración. ${msg}`);
    } finally {
      this.saving.set(false);
    }
  }
}
