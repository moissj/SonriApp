import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Cita } from '../../core/services/cita.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { RecordatorioService } from './services/recordatorio.service';

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, CardComponent, EmptyStateComponent],
  templateUrl: './recordatorios.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordatoriosComponent implements OnInit {
  private readonly whatsapp = inject(WhatsappService);
  private readonly recordatorioService = inject(RecordatorioService);

  readonly pendientes = signal<Cita[]>([]);
  readonly cargando = signal(true);
  readonly enviandoId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.whatsapp.preloadPlantillas();
    await this.cargar();
  }

  private async cargar(): Promise<void> {
    try {
      this.pendientes.set(await this.recordatorioService.getPendientes());
    } catch {
      this.error.set('No se pudieron cargar los recordatorios. Intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  /** Sin await previo: window.open debe ocurrir dentro del gesto del clic. */
  enviar(cita: Cita): void {
    this.enviandoId.set(cita.id ?? null);
    this.whatsapp
      .enviar({
        paciente: {
          id: cita.paciente_id,
          nombre_completo: cita.paciente?.nombre_completo ?? '',
          telefono: cita.paciente?.telefono ?? null,
        },
        tipo: 'recordatorio',
        cita: { id: cita.id, fecha_hora: cita.fecha_hora },
      })
      .then((ok) => {
        if (ok) this.pendientes.update((l) => l.filter((c) => c.id !== cita.id));
      })
      .catch(() => this.error.set('No se pudo enviar el recordatorio.'))
      .finally(() => this.enviandoId.set(null));
  }

  horaDe(cita: Cita): string {
    return this.whatsapp.formatHora(cita.fecha_hora);
  }

  sinTelefono(cita: Cita): boolean {
    return !cita.paciente?.telefono;
  }
}
