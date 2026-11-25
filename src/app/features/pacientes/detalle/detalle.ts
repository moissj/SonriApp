import { Component, ChangeDetectionStrategy, inject, signal, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { WhatsappService, MensajeEnviado } from '../../../core/services/whatsapp.service';
import { CardComponent } from '../../../shared/components/card/card';
import { AlertComponent } from '../../../shared/components/alert/alert';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';
import { PresupuestosComponent } from './presupuestos/presupuestos';
import { PagosComponent } from './pagos/pagos';
import { ConsentimientosPacienteComponent } from '../../consentimientos/components/consentimientos-paciente/consentimientos-paciente';
import { tieneAlergiaReal } from './funciones/alergia.funcion';

type TabId = 'info' | 'citas' | 'presupuestos' | 'pagos' | 'consentimientos' | 'comunicacion';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CardComponent,
    AlertComponent,
    EmptyStateComponent,
    ConfirmModalComponent,
    PresupuestosComponent,
    PagosComponent,
    ConsentimientosPacienteComponent,
  ],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacienteDetailComponent implements OnInit {
  protected readonly tieneAlergiaReal = tieneAlergiaReal;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly patientService = inject(PatientService);
  private readonly whatsapp = inject(WhatsappService);

  readonly activeTab = signal<TabId>('info');
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly patient = signal<Patient | null>(null);
  readonly citas = signal<any[]>([]);
  readonly historias = signal<any[]>([]);

  /** Historial de mensajes enviados al paciente (sección Comunicación) */
  readonly mensajes = signal<MensajeEnviado[]>([]);

  patientId!: string;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = id;
      void this.whatsapp.preloadPlantillas();
      this.loadPatientData();
      this.loadMensajes();
    } else {
      this.errorMessage.set('ID de paciente no válido.');
      this.isLoading.set(false);
    }
  }

  async loadPatientData(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const data = await this.patientService.getPatientById(this.patientId);
      if (data) {
        this.patient.set(data.patient);
        this.citas.set(data.citas);
        this.historias.set(data.historias);
      } else {
        this.errorMessage.set('No se pudo encontrar la información del paciente.');
      }
    } catch (err) {
      this.errorMessage.set('Ocurrió un error al cargar los detalles del paciente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Carga el historial de mensajes enviados a este paciente */
  async loadMensajes(): Promise<void> {
    try {
      this.mensajes.set(await this.whatsapp.getHistorial(this.patientId));
    } catch (err) {
      console.error('Error cargando historial de mensajes:', err);
    }
  }

  /** Envía el mensaje de bienvenida por WhatsApp y refresca el historial */
  async enviarWhatsApp(): Promise<void> {
    const p = this.patient();
    if (!p) return;
    const enviado = await this.whatsapp.enviar({
      paciente: { id: p.id, nombre_completo: p.nombre_completo, telefono: p.telefono },
      tipo: 'bienvenida',
    });
    if (enviado) this.loadMensajes();
  }

  changeTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  getAge(birthdate: string | null): number | null {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  readonly confirmModal = viewChild(ConfirmModalComponent);

  triggerDelete(): void {
    this.confirmModal()?.open();
  }

  async onDeleteConfirmed(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.patientService.deletePatient(this.patientId);
      this.router.navigate(['/pacientes']);
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      if (err.code === '23503') {
        this.errorMessage.set(
          'No se puede eliminar el paciente porque tiene citas o historias clínicas registradas en el sistema.'
        );
      } else {
        this.errorMessage.set('Error al eliminar el paciente. Intenta de nuevo.');
      }
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
