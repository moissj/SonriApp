import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Cita } from '../../core/services/cita.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { AlertComponent } from '../../shared/components/alert/alert';
import { ButtonComponent } from '../../shared/components/button/button';
import { CardComponent } from '../../shared/components/card/card';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { CitaRecordatorio, DiaRecordatorios } from './funciones/agrupar-por-dia.funcion';
import { RecordatorioService } from './services/recordatorio.service';

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, CardComponent, ConfirmModalComponent, EmptyStateComponent],
  templateUrl: './recordatorios.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordatoriosComponent implements OnInit {
  private readonly whatsapp = inject(WhatsappService);
  private readonly recordatorioService = inject(RecordatorioService);
  private readonly modal = viewChild.required(ConfirmModalComponent);

  readonly dias = signal<DiaRecordatorios[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly enviandoId = signal<string | null>(null);
  readonly enviandoLote = signal(false);
  readonly avisoPopup = signal(false);
  readonly diaLote = signal<DiaRecordatorios | null>(null);

  async ngOnInit(): Promise<void> {
    await this.whatsapp.preloadPlantillas();
    try {
      this.dias.set(await this.recordatorioService.getRecordatoriosRango(new Date()));
    } catch {
      this.error.set('No se pudieron cargar los recordatorios. Intenta de nuevo.');
    } finally {
      this.cargando.set(false);
    }
  }

  /** Sin await previo: window.open debe ocurrir dentro del gesto del clic. */
  enviar(cita: Cita): void {
    this.enviandoId.set(cita.id ?? null);
    this.disparar(cita)
      .catch(() => this.error.set('No se pudo enviar el recordatorio.'))
      .finally(() => this.enviandoId.set(null));
  }

  pedirConfirmacionLote(dia: DiaRecordatorios): void {
    this.diaLote.set(dia);
    this.modal().open();
  }

  /** El evento confirm se emite síncrono al clic: los window.open siguen dentro del gesto. */
  enviarTodos(): void {
    const dia = this.diaLote();
    if (!dia) return;
    this.avisoPopup.set(true);
    this.enviandoLote.set(true);
    const proms: Promise<void>[] = [];
    for (const { cita } of dia.pendientes) {
      if (this.sinTelefono(cita)) continue;
      proms.push(this.disparar(cita).catch(() => this.error.set('No se pudo enviar algún recordatorio.')));
    }
    Promise.allSettled(proms).finally(() => this.enviandoLote.set(false));
  }

  cantidadEnviables(dia: DiaRecordatorios | null): number {
    return dia?.pendientes.filter((p) => !this.sinTelefono(p.cita)).length ?? 0;
  }

  private disparar(cita: Cita): Promise<void> {
    return this.whatsapp
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
        if (ok) this.marcarEnviada(cita.id, new Date().toISOString());
      });
  }

  private marcarEnviada(id: string | undefined, ultimoEnvio: string): void {
    const porHora = (a: CitaRecordatorio, b: CitaRecordatorio) =>
      a.cita.fecha_hora.localeCompare(b.cita.fecha_hora);
    this.dias.update((ds) =>
      ds.map((d) => {
        const previa = [...d.pendientes, ...d.enviados].find((x) => x.cita.id === id);
        if (!previa) return d;
        return {
          ...d,
          pendientes: d.pendientes.filter((x) => x.cita.id !== id),
          enviados: [...d.enviados.filter((x) => x.cita.id !== id), { cita: previa.cita, ultimoEnvio }].sort(porHora),
        };
      }),
    );
  }

  fechaLarga(fecha: string): string {
    return new Date(`${fecha}T12:00:00-05:00`).toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota',
    });
  }

  horaDe(iso: string): string {
    return this.whatsapp.formatHora(iso);
  }

  sinTelefono(cita: Cita): boolean {
    return !cita.paciente?.telefono;
  }
}
