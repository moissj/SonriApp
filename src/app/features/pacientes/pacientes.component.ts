import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { combineLatest, from } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { PatientService, Patient } from '../../core/services/patient.service';
import { LayoutService } from '../../core/services/layout.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ButtonComponent } from '../../shared/components/button/button';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    TableModule,
    CardComponent,
    EmptyStateComponent,
    ButtonComponent,
    AlertComponent,
    ConfirmModalComponent,
    PageHeaderComponent,
  ],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacientesComponent {
  private readonly router = inject(Router);
  readonly patientService = inject(PatientService);
  readonly layout = inject(LayoutService);
  private readonly whatsapp = inject(WhatsappService);

  readonly searchControl = new FormControl('');
  private readonly refreshTrigger = signal(0);

  constructor() {
    void this.whatsapp.preloadPlantillas();
  }

  /** Mensaje de error para acciones (p. ej. eliminar con dependencias) */
  readonly errorMessage = signal<string | null>(null);

  /** Paciente pendiente de confirmación de borrado */
  readonly patientToDelete = signal<Patient | null>(null);

  private readonly confirmModal = viewChild(ConfirmModalComponent);

  /** Listado reactivo de pacientes, debounced y recargable */
  readonly patients = toSignal(
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      toObservable(this.refreshTrigger),
    ]).pipe(
      switchMap(([term]) => from(this.patientService.getPatients(term || '')))
    ),
    { initialValue: [] as Patient[] }
  );

  /**
   * Pacientes ordenados por la fecha de su última cita (más reciente primero).
   * Los que no tienen citas quedan al final. Alimenta la tabla de escritorio.
   */
  readonly patientsByLastVisit = computed(() =>
    [...this.patients()].sort((a, b) => {
      const dateA = a.ultima_cita ? new Date(a.ultima_cita).getTime() : 0;
      const dateB = b.ultima_cita ? new Date(b.ultima_cita).getTime() : 0;
      return dateB - dateA;
    })
  );

  /** Obtener iniciales de un paciente para el avatar */
  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  /** Navegar al detalle de un paciente */
  viewPatient(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }

  /** Navegar a la edición de un paciente */
  editPatient(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/pacientes', id, 'editar']);
  }

  /** Solicitar confirmación antes de eliminar un paciente */
  requestDelete(patient: Patient, event: Event): void {
    event.stopPropagation();
    this.errorMessage.set(null);
    this.patientToDelete.set(patient);
    this.confirmModal()?.open();
  }

  /** Eliminar el paciente confirmado y refrescar el listado */
  async onDeleteConfirmed(): Promise<void> {
    const patient = this.patientToDelete();
    if (!patient) return;

    try {
      await this.patientService.deletePatient(patient.id);
      this.patientToDelete.set(null);
      this.reload();
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      if (err?.code === '23503') {
        this.errorMessage.set(
          `No se puede eliminar a ${patient.nombre_completo} porque tiene citas o historias clínicas registradas.`
        );
      } else {
        this.errorMessage.set('Error al eliminar el paciente. Intenta de nuevo.');
      }
    }
  }

  /**
   * Envía un mensaje de bienvenida por WhatsApp al paciente.
   * Toda la lógica (render + URL + registro) vive en WhatsappService.
   */
  sendWhatsApp(patient: Patient, event: Event): void {
    event.stopPropagation();
    void this.whatsapp.enviar({
      paciente: { id: patient.id, nombre_completo: patient.nombre_completo, telefono: patient.telefono },
      tipo: 'bienvenida',
    });
  }

  /** Forzar recarga de pacientes */
  reload(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}
