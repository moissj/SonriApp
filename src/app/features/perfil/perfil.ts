import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UbicacionService, Departamento, Municipio } from '../../core/services/ubicacion.service';
import { CardComponent } from '../../shared/components/card/card';
import { AlertComponent } from '../../shared/components/alert/alert';
import { DURACIONES_CITA } from '../../shared/constants/colombia';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, AlertComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly ubicacion = inject(UbicacionService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = this.profileService.profile;
  readonly duraciones = DURACIONES_CITA;

  readonly departamentos = signal<Departamento[]>([]);
  readonly municipios = signal<Municipio[]>([]);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly enviandoReset = signal(false);

  readonly logoPreview = signal<string | null>(null);
  private selectedLogoFile: File | null = null;
  private patched = false;

  readonly email = computed(() => this.auth.user()?.email ?? '');

  readonly initials = computed(() => {
    const name = this.profile()?.nombre_completo?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    }
    const e = this.email();
    return e ? e[0].toUpperCase() : '?';
  });

  readonly form = this.fb.nonNullable.group({
    nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
    nombre_consultorio: ['', [Validators.required]],
    telefono_contacto: ['', [Validators.pattern(/^\+?57?\s?\d{10}$/)]],
    ciudad: [''],
    departamento: [''],
    horario_apertura: [''],
    horario_cierre: [''],
    duracion_cita_defecto: [30],
  });

  constructor() {
    void this.loadDepartamentos();

    // Cargar municipios cuando cambia el departamento
    this.form.controls.departamento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((n) => this.onDepartamentoChange(n));

    // Rellenar el formulario cuando el perfil esté disponible (una sola vez)
    effect(() => {
      const p = this.profile();
      if (p && !this.patched) {
        this.form.patchValue({
          nombre_completo: p.nombre_completo ?? '',
          nombre_consultorio: p.nombre_consultorio ?? '',
          telefono_contacto: p.telefono_contacto ?? '',
          ciudad: p.ciudad ?? '',
          departamento: p.departamento ?? '',
          horario_apertura: p.horario_apertura ?? '',
          horario_cierre: p.horario_cierre ?? '',
          duracion_cita_defecto: p.duracion_cita_defecto ?? 30,
        });
        this.patched = true;
      }
    });
  }

  private async loadDepartamentos(): Promise<void> {
    try {
      this.departamentos.set(await this.ubicacion.getDepartamentos());
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  }

  /** Carga los municipios del departamento y limpia la ciudad si ya no aplica */
  private async onDepartamentoChange(nombre: string | null): Promise<void> {
    if (this.departamentos().length === 0) await this.loadDepartamentos();
    const dep = this.departamentos().find((d) => d.nombre === nombre);
    if (!dep) {
      this.municipios.set([]);
      return;
    }
    try {
      const munis = await this.ubicacion.getMunicipios(dep.id);
      this.municipios.set(munis);
      const ciudad = this.form.controls.ciudad.value;
      if (ciudad && !munis.some((m) => m.nombre === ciudad)) {
        this.form.controls.ciudad.setValue('');
      }
    } catch (err) {
      console.error('Error cargando municipios:', err);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.error.set('La imagen no debe superar 2 MB.');
      return;
    }
    this.error.set(null);
    this.selectedLogoFile = file;
    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      let logoUrl: string | null = null;
      if (this.selectedLogoFile) {
        logoUrl = await this.profileService.uploadLogo(this.selectedLogoFile);
      }
      const v = this.form.getRawValue();
      await this.profileService.updateProfile({
        nombre_completo: v.nombre_completo,
        nombre_consultorio: v.nombre_consultorio,
        telefono_contacto: v.telefono_contacto || null,
        ciudad: v.ciudad || null,
        departamento: v.departamento || null,
        horario_apertura: v.horario_apertura || null,
        horario_cierre: v.horario_cierre || null,
        duracion_cita_defecto: Number(v.duracion_cita_defecto),
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      });
      this.selectedLogoFile = null;
      this.logoPreview.set(null);
      this.success.set('Tu perfil se actualizó correctamente.');
    } catch (err) {
      console.error('Error guardando perfil:', err);
      this.error.set('No se pudo guardar el perfil. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  async cambiarPassword(): Promise<void> {
    const correo = this.email();
    if (!correo) return;
    this.enviandoReset.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      await this.auth.recoverPassword(correo);
      this.success.set(`Te enviamos un correo a ${correo} para cambiar tu contraseña.`);
    } catch {
      this.error.set('No se pudo enviar el correo de cambio de contraseña.');
    } finally {
      this.enviandoReset.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
