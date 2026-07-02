import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  viewChild,
  HostListener,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, startWith } from 'rxjs/operators';
import { AdminService, CuentaOdontologo, AdminStats } from '../../core/services/admin.service';
import { LayoutService } from '../../core/services/layout.service';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { ModalComponent } from '../../shared/components/modal/modal';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';

const PLANES = ['basico', 'profesional', 'premium'];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    NgTemplateOutlet,
    CardComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private readonly adminService = inject(AdminService);
  readonly layout = inject(LayoutService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly planes = PLANES;

  readonly cuentas = signal<CuentaOdontologo[]>([]);
  readonly stats = signal<AdminStats>({ activas: 0, suspendidas: 0, porVencer30: 0 });
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly searchControl = new FormControl('');
  readonly openMenuId = signal<string | null>(null);

  /** Cuenta en edición de plan / pendiente de eliminar */
  readonly editando = signal<CuentaOdontologo | null>(null);
  readonly aEliminar = signal<CuentaOdontologo | null>(null);

  private readonly nuevaModal = viewChild<ModalComponent>('nuevaModal');
  private readonly planModal = viewChild<ModalComponent>('planModal');
  private readonly confirmModal = viewChild(ConfirmModalComponent);

  readonly nuevaForm = this.fb.nonNullable.group({
    nombre_completo: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    nombre_consultorio: ['', [Validators.required]],
    plan_contratado: ['basico', [Validators.required]],
    fecha_vencimiento_plan: ['', [Validators.required]],
  });

  readonly planForm = this.fb.nonNullable.group({
    plan_contratado: ['basico', [Validators.required]],
    fecha_vencimiento_plan: ['', [Validators.required]],
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(startWith(''), debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
    this.loadStats();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.cuentas.set(await this.adminService.getCuentas(this.searchControl.value || ''));
    } catch (err) {
      console.error('Error cargando cuentas:', err);
      this.error.set('No se pudieron cargar las cuentas.');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadStats(): Promise<void> {
    try {
      this.stats.set(await this.adminService.getStats());
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((cur) => (cur === id ? null : id));
  }

  @HostListener('document:click')
  closeMenu(): void {
    if (this.openMenuId()) this.openMenuId.set(null);
  }

  // --- Nueva cuenta ---
  abrirNueva(): void {
    this.error.set(null);
    this.nuevaForm.reset({ plan_contratado: 'basico', nombre_completo: '', email: '', nombre_consultorio: '', fecha_vencimiento_plan: '' });
    this.nuevaModal()?.open();
  }

  async guardarNueva(): Promise<void> {
    if (this.nuevaForm.invalid) {
      this.nuevaForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.adminService.crearCuenta(this.nuevaForm.getRawValue());
      this.nuevaModal()?.close();
      await Promise.all([this.load(), this.loadStats()]);
    } catch (err: any) {
      console.error('Error creando cuenta:', err);
      this.error.set(err?.message || 'No se pudo crear la cuenta.');
    } finally {
      this.saving.set(false);
    }
  }

  // --- Acciones rápidas ---
  async suspender(c: CuentaOdontologo): Promise<void> {
    this.openMenuId.set(null);
    await this.cambiarEstado(c, 'suspendido');
  }

  async reactivar(c: CuentaOdontologo): Promise<void> {
    this.openMenuId.set(null);
    await this.cambiarEstado(c, 'activo');
  }

  private async cambiarEstado(c: CuentaOdontologo, estado: 'activo' | 'suspendido'): Promise<void> {
    try {
      await this.adminService.setEstado(c.id, estado);
      this.cuentas.update((list) => list.map((x) => (x.id === c.id ? { ...x, estado_cuenta: estado } : x)));
      this.loadStats();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      this.error.set('No se pudo actualizar el estado.');
    }
  }

  abrirEditarPlan(c: CuentaOdontologo): void {
    this.openMenuId.set(null);
    this.editando.set(c);
    this.planForm.reset({
      plan_contratado: c.plan_contratado ?? 'basico',
      fecha_vencimiento_plan: c.fecha_vencimiento_plan ?? '',
    });
    this.planModal()?.open();
  }

  async guardarPlan(): Promise<void> {
    const c = this.editando();
    if (!c || this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const { plan_contratado, fecha_vencimiento_plan } = this.planForm.getRawValue();
      await this.adminService.setPlan(c.id, plan_contratado, fecha_vencimiento_plan);
      this.cuentas.update((list) =>
        list.map((x) => (x.id === c.id ? { ...x, plan_contratado, fecha_vencimiento_plan } : x))
      );
      this.planModal()?.close();
      this.loadStats();
    } catch (err) {
      console.error('Error actualizando plan:', err);
      this.error.set('No se pudo actualizar el plan.');
    } finally {
      this.saving.set(false);
    }
  }

  pedirEliminar(c: CuentaOdontologo): void {
    this.openMenuId.set(null);
    this.aEliminar.set(c);
    this.confirmModal()?.open();
  }

  async confirmarEliminar(): Promise<void> {
    const c = this.aEliminar();
    if (!c) return;
    try {
      await this.adminService.eliminarCuenta(c.id);
      this.cuentas.update((list) => list.filter((x) => x.id !== c.id));
      this.loadStats();
    } catch (err) {
      console.error('Error eliminando cuenta:', err);
      this.error.set('No se pudo eliminar la cuenta.');
    } finally {
      this.aEliminar.set(null);
    }
  }

  closeNueva(): void {
    this.nuevaModal()?.close();
  }

  closePlan(): void {
    this.planModal()?.close();
  }
}
