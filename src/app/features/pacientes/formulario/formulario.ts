import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientService } from '../../../core/services/patient.service';
import { UbicacionService, Departamento, Municipio } from '../../../core/services/ubicacion.service';
import { EpsService, Eps } from '../../../core/services/eps.service';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { CardComponent } from '../../../shared/components/card/card';
import { ParentescoSelectComponent } from '../../../shared/components/parentesco-select/parentesco-select';

/** Teléfono celular Colombia: 10 dígitos empezando por 3, con prefijo +57 opcional */
const CELULAR_REGEX = /^(\+57)?3[0-9]{9}$/;

@Component({
  selector: 'app-paciente-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    CardComponent,
    ParentescoSelectComponent,
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
  private readonly epsService = inject(EpsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly departamentos = signal<Departamento[]>([]);
  readonly municipios = signal<Municipio[]>([]);
  readonly municipiosNacimiento = signal<Municipio[]>([]);
  readonly epsList = signal<Eps[]>([]);

  /** Fecha de nacimiento (para calcular la edad de solo lectura) */
  private readonly fechaNacimiento = signal<string>('');
  readonly edad = computed(() => {
    const f = this.fechaNacimiento();
    if (!f) return null;
    const birth = new Date(f);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : null;
  });

  readonly estadosCiviles = ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)'];
  readonly tiposVinculacion = ['Cotizante', 'Beneficiario', 'Subsidiado'];

  patientId: string | null = null;
  patientForm!: FormGroup;

  async ngOnInit(): Promise<void> {
    this.initForm();
    await Promise.all([this.loadDepartamentos(), this.loadEps()]);

    this.patientForm
      .get('departamento')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => this.onDepartamentoChange(nombre));

    this.patientForm
      .get('lugar_nacimiento_departamento')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => this.onDepartamentoNacimientoChange(nombre));

    this.patientForm
      .get('fecha_nacimiento')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => this.fechaNacimiento.set(val ?? ''));

    await this.checkMode();
  }

  private async loadDepartamentos(): Promise<void> {
    try {
      this.departamentos.set(await this.ubicacion.getDepartamentos());
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  }

  private async loadEps(): Promise<void> {
    try {
      this.epsList.set(await this.epsService.getEps());
    } catch (err) {
      console.error('Error cargando catálogo de EPS:', err);
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

  /** Al cambiar el departamento de nacimiento, carga sus municipios */
  private async onDepartamentoNacimientoChange(nombre: string | null): Promise<void> {
    const dep = this.departamentos().find((d) => d.nombre === nombre);
    if (!dep) {
      this.municipiosNacimiento.set([]);
      return;
    }
    try {
      const munis = await this.ubicacion.getMunicipios(dep.id);
      this.municipiosNacimiento.set(munis);
      const ciudad = this.patientForm.get('lugar_nacimiento_ciudad')?.value;
      if (ciudad && !munis.some((m) => m.nombre === ciudad)) {
        this.patientForm.get('lugar_nacimiento_ciudad')?.setValue('');
      }
    } catch (err) {
      console.error('Error cargando municipios de nacimiento:', err);
    }
  }

  private initForm(): void {
    this.patientForm = this.fb.group({
      // --- Identificación ---
      primer_apellido: ['', [Validators.required, Validators.minLength(2)]],
      segundo_apellido: [''],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      tipo_documento: ['CC', [Validators.required]],
      numero_documento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]{5,20}$/)]],
      fecha_nacimiento: [''],
      lugar_nacimiento_ciudad: [''],
      lugar_nacimiento_departamento: [''],
      sexo: [''],
      estado_civil: [''],

      // --- Contacto y ubicación ---
      telefono: ['', [Validators.pattern(CELULAR_REGEX)]],
      telefono_fijo: ['', [Validators.pattern(/^[0-9]{7,10}$/)]],
      email: ['', [Validators.email]],
      direccion: [''],
      barrio: [''],
      departamento: [''],
      ciudad: [''],

      // --- Datos de afiliación en salud ---
      eps_id: [''],
      tipo_vinculacion: [''],

      // --- Ocupación ---
      ocupacion: [''],
      direccion_laboral: [''],
      telefono_laboral: ['', [Validators.pattern(/^[0-9]{7,10}$/)]],

      // --- Responsable (obligatorio) ---
      responsable: this.fb.group({
        nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
        parentesco: ['', [Validators.required]],
        telefono: ['', [Validators.required, Validators.pattern(CELULAR_REGEX)]],
      }),

      // --- Acompañante (obligatorio) ---
      acompanante: this.fb.group({
        nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
        parentesco: ['', [Validators.required]],
        telefono: ['', [Validators.required, Validators.pattern(CELULAR_REGEX)]],
      }),

      // --- Remite (obligatorio, sin teléfono) ---
      remite: this.fb.group({
        nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
        parentesco: ['', [Validators.required]],
      }),

      // --- Antecedentes médicos (resumen rápido) ---
      antecedentes_medicos: [''],
      alergias: [''],
      notas_generales: [''],
    });
  }

  private async checkMode(): Promise<void> {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (!this.patientId) return;

    this.isEditMode.set(true);
    this.isLoading.set(true);
    try {
      const data = await this.patientService.getPatientById(this.patientId);
      if (data) {
        const p = data.patient;
        this.patientForm.patchValue({
          primer_apellido: p.primer_apellido ?? '',
          segundo_apellido: p.segundo_apellido ?? '',
          nombres: p.nombres ?? '',
          tipo_documento: p.tipo_documento ?? 'CC',
          numero_documento: p.numero_documento ?? '',
          fecha_nacimiento: p.fecha_nacimiento ?? '',
          lugar_nacimiento_ciudad: p.lugar_nacimiento_ciudad ?? '',
          lugar_nacimiento_departamento: p.lugar_nacimiento_departamento ?? '',
          sexo: p.sexo ?? '',
          estado_civil: p.estado_civil ?? '',
          telefono: p.telefono ?? '',
          telefono_fijo: p.telefono_fijo ?? '',
          email: p.email ?? '',
          direccion: p.direccion ?? '',
          barrio: p.barrio ?? '',
          departamento: p.departamento ?? '',
          ciudad: p.ciudad ?? '',
          eps_id: p.eps_id ?? '',
          tipo_vinculacion: p.tipo_vinculacion ?? '',
          ocupacion: p.ocupacion ?? '',
          direccion_laboral: p.direccion_laboral ?? '',
          telefono_laboral: p.telefono_laboral ?? '',
          responsable: {
            nombre_completo: p.responsable?.nombre_completo ?? '',
            parentesco: p.responsable?.parentesco ?? '',
            telefono: p.responsable?.telefono ?? '',
          },
          acompanante: {
            nombre_completo: p.acompanante?.nombre_completo ?? '',
            parentesco: p.acompanante?.parentesco ?? '',
            telefono: p.acompanante?.telefono ?? '',
          },
          remite: {
            nombre_completo: p.remite?.nombre_completo ?? '',
            parentesco: p.remite?.parentesco ?? '',
          },
          antecedentes_medicos: p.antecedentes_medicos ?? '',
          alergias: p.alergias ?? '',
          notas_generales: p.notas_generales ?? '',
        });
        this.fechaNacimiento.set(p.fecha_nacimiento ?? '');
      } else {
        this.errorMessage.set('No se encontró el paciente solicitado.');
      }
    } catch (err) {
      this.errorMessage.set('Error al cargar la información del paciente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Retorna mensaje de error específico para un campo (soporta grupos anidados con ruta) */
  getFieldError(path: string): string {
    const control = this.patientForm.get(path);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['email']) return 'El formato del correo electrónico no es válido.';
    if (control.errors['pattern']) {
      if (path.endsWith('telefono')) {
        return 'Número celular válido en Colombia (ej. 3001234567).';
      }
      if (path.includes('telefono_fijo') || path.includes('telefono_laboral')) {
        return 'Número fijo válido (entre 7 y 10 dígitos).';
      }
      if (path === 'numero_documento') {
        return 'Documento no válido (entre 5 y 20 caracteres alfanuméricos).';
      }
      return 'El valor ingresado no es válido.';
    }
    return 'Campo inválido.';
  }

  /** Normaliza un celular colombiano a 10 dígitos (sin +57) según el CHECK de la BD */
  private normalizarCelular(phone: string | null | undefined): string | null {
    if (!phone) return null;
    const digits = phone.toString().replace(/\D/g, '');
    const norm = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
    return norm || null;
  }

  private soloDigitos(value: string | null | undefined): string | null {
    if (!value) return null;
    const digits = value.toString().replace(/\D/g, '');
    return digits || null;
  }

  private limpiar(value: any): any {
    return value === '' || value === undefined ? null : value;
  }

  async onSubmit(): Promise<void> {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.errorMessage.set('Revisa los campos obligatorios: identificación, responsable, acompañante y remite.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const v = this.patientForm.getRawValue();

    const payload: any = {
      nombres: this.limpiar(v.nombres),
      primer_apellido: this.limpiar(v.primer_apellido),
      segundo_apellido: this.limpiar(v.segundo_apellido),
      tipo_documento: v.tipo_documento,
      numero_documento: this.limpiar(v.numero_documento),
      fecha_nacimiento: this.limpiar(v.fecha_nacimiento),
      lugar_nacimiento_ciudad: this.limpiar(v.lugar_nacimiento_ciudad),
      lugar_nacimiento_departamento: this.limpiar(v.lugar_nacimiento_departamento),
      sexo: this.limpiar(v.sexo),
      estado_civil: this.limpiar(v.estado_civil),
      telefono: this.normalizarCelular(v.telefono),
      telefono_fijo: this.soloDigitos(v.telefono_fijo),
      email: this.limpiar(v.email),
      direccion: this.limpiar(v.direccion),
      barrio: this.limpiar(v.barrio),
      departamento: this.limpiar(v.departamento),
      ciudad: this.limpiar(v.ciudad),
      eps_id: this.limpiar(v.eps_id),
      tipo_vinculacion: this.limpiar(v.tipo_vinculacion),
      ocupacion: this.limpiar(v.ocupacion),
      direccion_laboral: this.limpiar(v.direccion_laboral),
      telefono_laboral: this.soloDigitos(v.telefono_laboral),
      responsable: {
        nombre_completo: v.responsable.nombre_completo,
        parentesco: v.responsable.parentesco,
        telefono: this.normalizarCelular(v.responsable.telefono),
      },
      acompanante: {
        nombre_completo: v.acompanante.nombre_completo,
        parentesco: v.acompanante.parentesco,
        telefono: this.normalizarCelular(v.acompanante.telefono),
      },
      remite: {
        nombre_completo: v.remite.nombre_completo,
        parentesco: v.remite.parentesco,
      },
      antecedentes_medicos: this.limpiar(v.antecedentes_medicos),
      alergias: this.limpiar(v.alergias),
      notas_generales: this.limpiar(v.notas_generales),
    };

    try {
      if (this.isEditMode() && this.patientId) {
        await this.patientService.updatePatient(this.patientId, payload);
        this.successMessage.set('Paciente actualizado con éxito.');
        setTimeout(() => this.router.navigate(['/pacientes', this.patientId]), 1200);
      } else {
        const created = await this.patientService.createPatient(payload);
        this.successMessage.set('Paciente registrado con éxito.');
        setTimeout(() => this.router.navigate(['/pacientes', created.id]), 1200);
      }
    } catch (err: any) {
      console.error('Error saving patient:', err);
      if (err.code === '23505') {
        this.errorMessage.set('Ya existe un paciente registrado con ese número de documento.');
      } else {
        this.errorMessage.set(err.message || 'Ocurrió un error al guardar el paciente. Intenta de nuevo.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
