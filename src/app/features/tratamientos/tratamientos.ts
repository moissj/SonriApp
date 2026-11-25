import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TratamientoService, Tratamiento } from '../../core/services/tratamiento.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ModalComponent } from '../../shared/components/modal/modal';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { FormFooterComponent } from '../../shared/components/form-footer/form-footer';
import { LayoutService } from '../../core/services/layout.service';
import { SegmentedControlComponent, OpcionSegmento } from '../../shared/components/segmented-control/segmented-control';
import { FiltroEstado, contarActivos, duracionPromedio, filtrarTratamientos, precioPromedio } from './funciones/tratamientos.funcion';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CopCurrencyPipe,
    CardComponent,
    EmptyStateComponent,
    ModalComponent,
    ConfirmModalComponent,
    TableModule,
    NgTemplateOutlet,
    PageHeaderComponent,
    KpiCard,
    ButtonComponent,
    InputComponent,
    StatusBadgeComponent,
    FormFooterComponent,
    SegmentedControlComponent,
  ],
  templateUrl: './tratamientos.html',
  styleUrl: './tratamientos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TratamientosComponent {
  private readonly tratamientoService = inject(TratamientoService);
  private readonly fb = inject(FormBuilder);
  readonly layout = inject(LayoutService);

  readonly tratamientos = signal<Tratamiento[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Tratamiento en edición (null = creando uno nuevo) */
  readonly editing = signal<Tratamiento | null>(null);
  /** Tratamiento pendiente de eliminar */
  readonly toDelete = signal<Tratamiento | null>(null);

  readonly buscarControl = new FormControl('', { nonNullable: true });
  private readonly busqueda = toSignal(this.buscarControl.valueChanges, { initialValue: '' });
  readonly estado = signal<FiltroEstado | null>('todos');
  readonly estados: OpcionSegmento<FiltroEstado>[] = [
    { label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, { label: 'Inactivos', value: 'inactivos' },
  ];

  readonly tratamientosFiltrados = computed(() =>
    filtrarTratamientos(this.tratamientos(), this.estado() ?? 'todos', this.busqueda()),
  );
  readonly totalActivos = computed(() => contarActivos(this.tratamientos()));
  readonly precioProm = computed(() => precioPromedio(this.tratamientos()));
  readonly duracionProm = computed(() => duracionPromedio(this.tratamientos()));

  private readonly modal = viewChild(ModalComponent);
  private readonly confirmModal = viewChild(ConfirmModalComponent);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: [''],
    precio_base: [0, [Validators.required, Validators.min(0)]],
    duracion_minutos: [30, [Validators.required, Validators.min(5)]],
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.tratamientos.set(await this.tratamientoService.getTratamientos());
    } catch (err) {
      console.error('Error cargando tratamientos:', err);
      this.error.set('No se pudo cargar el catálogo.');
    } finally {
      this.loading.set(false);
    }
  }

  /** Abre el modal para crear un tratamiento nuevo */
  nuevo(): void {
    this.editing.set(null);
    this.form.reset({ nombre: '', descripcion: '', precio_base: 0, duracion_minutos: 30 });
    this.modal()?.open();
  }

  /** Abre el modal para editar un tratamiento existente */
  editar(t: Tratamiento): void {
    this.editing.set(t);
    this.form.reset({
      nombre: t.nombre,
      descripcion: t.descripcion ?? '',
      precio_base: t.precio_base,
      duracion_minutos: t.duracion_minutos,
    });
    this.modal()?.open();
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      const { nombre, descripcion, precio_base, duracion_minutos } = this.form.getRawValue();
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio_base: Number(precio_base),
        duracion_minutos: Number(duracion_minutos),
      };

      const editing = this.editing();
      if (editing) {
        const actualizado = await this.tratamientoService.updateTratamiento(editing.id, payload);
        this.tratamientos.update((list) =>
          list.map((t) => (t.id === actualizado.id ? actualizado : t)).sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      } else {
        const creado = await this.tratamientoService.createTratamiento(payload);
        this.tratamientos.update((list) =>
          [...list, creado].sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      }
      this.modal()?.close();
    } catch (err) {
      console.error('Error guardando tratamiento:', err);
      this.error.set('No se pudo guardar el tratamiento. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  limpiarFiltros(): void {
    this.buscarControl.setValue('');
    this.estado.set('todos');
  }

  /** Activa/desactiva (reversible, sin confirmación). */
  async alternarActivo(t: Tratamiento): Promise<void> {
    this.error.set(null);
    try {
      const actualizado = await this.tratamientoService.updateTratamiento(t.id, { activo: !t.activo });
      this.tratamientos.update((list) => list.map((x) => (x.id === actualizado.id ? actualizado : x)));
    } catch (err) {
      console.error('Error cambiando estado del tratamiento:', err);
      this.error.set('No se pudo cambiar el estado del tratamiento.');
    }
  }

  pedirEliminar(t: Tratamiento): void {
    this.toDelete.set(t);
    this.confirmModal()?.open();
  }

  async confirmarEliminar(): Promise<void> {
    const t = this.toDelete();
    if (!t) return;
    try {
      await this.tratamientoService.deleteTratamiento(t.id);
      this.tratamientos.update((list) => list.filter((x) => x.id !== t.id));
    } catch (err) {
      console.error('Error eliminando tratamiento:', err);
      this.error.set('No se pudo eliminar el tratamiento.');
    } finally {
      this.toDelete.set(null);
    }
  }

  closeModal(): void {
    this.modal()?.close();
  }
}
