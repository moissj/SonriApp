import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { UbicacionService, Departamento, Municipio } from '../../../core/services/ubicacion.service';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { CardComponent } from '../../../shared/components/card/card';

@Component({
  selector: 'app-paciente-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    CardComponent,
  ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly patientService = inject(PatientService);
  private readonly ubicacion = inject(UbicacionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly departamentos = signal<Departamento[]>([]);
  readonly municipios = signal<Municipio[]>([]);

  patientId: string | null = null;
  patientForm!: FormGroup;

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.loadDepartamentos();
    this.patientForm
      .get('departamento')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => this.onDepartamentoChange(nombre));
    await this.checkMode();
  }

  private async loadDepartamentos(): Promise<void> {
    try {
      this.departamentos.set(await this.ubicacion.getDepartamentos());
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  }

  /** Al cambiar el departamento, carga sus municipios y limpia la ciudad si ya no aplica */
  private async onDepartamentoChange(nombre: string | null): Promise<void> {
    const dep = this.departamentos().find((d) => d.nombre === nombre);
    if (!dep) {
      this.municipios.set([]);
      return;
    }
    try {
      const munis = await this.ubicacion.getMunicipios(dep.id);
      this.municipios.set(munis);
      const ciudad = this.patientForm.get('ciudad')?.value;
      if (ciudad && !munis.some((m) => m.nombre === ciudad)) {
        this.patientForm.get('ciudad')?.setValue('');
      }
    } catch (err) {
      console.error('Error cargando municipios:', err);
    }
  }

  private initForm(): void {
    // Expresión regular para validar teléfonos en Colombia:
    // Permite 10 dígitos que empiecen por 3 (ej. 3001234567) o con prefijo opcional +57 (ej. +573001234567)
    const colombiaPhoneRegex = /^(\+57)?3[0-9]{9}$/;

    this.patientForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      tipo_documento: ['CC', [Validators.required]],
      numero_documento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]{5,20}$/)]],
      telefono: ['', [Validators.pattern(colombiaPhoneRegex)]],
      email: ['', [Validators.email]],
      fecha_nacimiento: [''],
      ciudad: [''],
      departamento: [''],
      direccion: [''],
      antecedentes_medicos: [''],
      alergias: [''],
      afiliacion_salud: [''],
      notas_generales: [''],
    });
  }

  private async checkMode(): Promise<void> {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.isEditMode.set(true);
      this.isLoading.set(true);
      try {
        const data = await this.patientService.getPatientById(this.patientId);
        if (data) {
          this.patientForm.patchValue(data.patient);
        } else {
          this.errorMessage.set('No se encontró el paciente solicitado.');
        }
      } catch (err) {
        this.errorMessage.set('Error al cargar la información del paciente.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  /** Retorna mensaje de error específico para un campo */
  getFieldError(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['email']) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'telefono') {
        return 'Debe ser un número celular válido en Colombia (ej. 3001234567 o +573001234567).';
      }
      if (fieldName === 'numero_documento') {
        return 'Documento no válido (entre 5 y 20 caracteres alfanuméricos).';
      }
      return 'El valor ingresado no es válido.';
    }

    return 'Campo inválido.';
  }

  async onSubmit(): Promise<void> {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.patientForm.value;

    // El teléfono se almacena como 10 dígitos (sin +57), acorde al CHECK de la BD.
    let phone = formValue.telefono;
    if (phone) {
      const digits = phone.toString().replace(/\D/g, '');
      phone = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
    }
    
    // Normalizar valores vacíos a nulos antes de guardar
    const normalizedValue = Object.keys(formValue).reduce((acc: any, key) => {
      const val = key === 'telefono' ? phone : formValue[key];
      acc[key] = val === '' ? null : val;
      return acc;
    }, {});

    try {
      if (this.isEditMode() && this.patientId) {
        await this.patientService.updatePatient(this.patientId, normalizedValue);
        this.successMessage.set('Paciente actualizado con éxito.');
        setTimeout(() => {
          this.router.navigate(['/pacientes', this.patientId]);
        }, 1500);
      } else {
        const created = await this.patientService.createPatient(normalizedValue);
        this.successMessage.set('Paciente registrado con éxito.');
        setTimeout(() => {
          this.router.navigate(['/pacientes', created.id]);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving patient:', err);
      // Mensaje en español adaptado
      if (err.code === '23505') {
        this.errorMessage.set('Ya existe un paciente registrado con ese número de documento.');
      } else {
        this.errorMessage.set(err.message || 'Ocurrió un error al guardar el paciente. Por favor, intenta de nuevo.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
