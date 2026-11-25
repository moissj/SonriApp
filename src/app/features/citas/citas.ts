import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, OnInit, OnDestroy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule, DatePipe, NgTemplateOutlet } from '@angular/common';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { CitaService, Cita } from '../../core/services/cita.service';
import { AuthService } from '../../core/services/auth.service';
import { TipoPlantilla } from '../../core/services/plantilla.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { supabase } from '../../core/supabase.client';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { SegmentedControlComponent, OpcionSegmento } from '../../shared/components/segmented-control/segmented-control';
import { CitaModalComponent } from './cita-modal/cita-modal';
import { CitaDetalleComponent } from './cita-detalle/cita-detalle';
import { aFechaBogota, fechaLargaBogota, hoyBogota } from '../../core/funciones/fecha-bogota.funcion';
import { VistaAgenda, cabecerasSemana, celdasMes, desplazar, rangoConsulta, textoRango } from './funciones/calendario.funcion';
import { HORA_INICIO, HORA_FIN, PX_POR_HORA, agruparPorDia, clasesCita, horaBogota, posicionAhora, posicionBloque } from './funciones/agenda.funcion';

type EstadoCita = Cita['estado'];

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, DatePipe, NgTemplateOutlet, StatusBadgeComponent, ConfirmModalComponent, CitaModalComponent, CitaDetalleComponent, SegmentedControlComponent],
  templateUrl: './citas.html',
  styleUrl: './citas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitasComponent implements OnInit, OnDestroy {
  private readonly citaService = inject(CitaService);
  private readonly authService = inject(AuthService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    // ?nueva=1 abre el modal de nueva cita (acceso rápido desde otras pantallas)
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      if (p.get('nueva') === '1') setTimeout(() => this.openCitaForm());
    });
    effect(() => {
      // Trigger change detection when displayCitas updates
      this.displayCitas();
      this.cdr.markForCheck();
    });
  }

  readonly selectedDate = signal<string>(hoyBogota());
  readonly currentView = signal<VistaAgenda>('dia');
  readonly refreshTrigger = signal<number>(0);
  readonly opcionesVista: OpcionSegmento<VistaAgenda>[] = [
    { label: 'Día', value: 'dia' },
    { label: 'Semana', value: 'semana' },
    { label: 'Mes', value: 'mes' },
    { label: 'Lista', value: 'lista' },
  ];

  /** Detalle de cita abierto en el Drawer (se resuelve por id para ver el estado optimista) */
  readonly detalleId = signal<string | null>(null);
  readonly detalleAbierto = signal(false);

  /** Cita pendiente de confirmar cancelación (acción destructiva) */
  readonly citaPendingCancel = signal<Cita | null>(null);

  // Registro de overrides locales para Optimistic Updates
  readonly localCitasOverride = signal<Record<string, EstadoCita>>({});

  readonly citaModal = viewChild(CitaModalComponent);
  readonly confirmModal = viewChild(ConfirmModalComponent);

  private realtimeChannel: any;
  private timerAhora?: ReturnType<typeof setInterval>;

  /** Instante actual (se refresca cada minuto) para la línea de hora actual */
  readonly ahora = signal(new Date());
  readonly hoy = computed(() => aFechaBogota(this.ahora()));
  readonly lineaAhora = computed(() => posicionAhora(this.ahora()));
  readonly altoGrilla = (HORA_FIN - HORA_INICIO) * PX_POR_HORA;
  readonly pxHora = PX_POR_HORA;
  readonly clasesCita = clasesCita;
  readonly horaBogota = horaBogota;
  readonly etiquetaDia = (dia: string): string => fechaLargaBogota(new Date(`${dia}T12:00:00Z`));

  readonly weekHeaders = computed(() => cabecerasSemana(this.selectedDate()));
  readonly monthCells = computed(() => celdasMes(this.selectedDate(), hoyBogota()));
  readonly fetchRange = computed(() => rangoConsulta(this.currentView(), this.selectedDate()));
  readonly dateRangeText = computed(() => textoRango(this.currentView(), this.selectedDate()));

  // Cargar citas reactivas
  readonly citas = toSignal(
    toObservable(computed(() => ({ range: this.fetchRange(), trigger: this.refreshTrigger() }))).pipe(
      switchMap(({ range }) => from(this.citaService.getCitas(range.start, range.end)))
    ),
    { initialValue: [] as Cita[] }
  );

  // Mezclar citas con los overrides locales de estado
  readonly displayCitas = computed(() => {
    const overrides = this.localCitasOverride();
    return this.citas().map((c) => (c.id && overrides[c.id] ? { ...c, estado: overrides[c.id] } : c));
  });

  /** Citas agrupadas por día Bogota, en orden cronológico (vista Lista) */
  readonly grupos = computed(() => agruparPorDia(this.displayCitas()));
  private readonly porDia = computed(() => new Map(this.grupos().map((g) => [g.dia, g.citas])));

  /** Bloques de grilla (posición y alto proporcional) por día; excluye citas fuera de 08-20 */
  readonly bloques = computed(() => {
    const mapa = new Map<string, { cita: Cita; top: number; height: number }[]>();
    for (const [dia, lista] of this.porDia()) {
      mapa.set(dia, lista.flatMap((cita) => {
        const pos = posicionBloque(cita.fecha_hora, cita.duracion_minutos);
        return pos ? [{ cita, ...pos }] : [];
      }));
    }
    return mapa;
  });

  readonly selectedDayCitas = computed(() => this.porDia().get(this.selectedDate()) ?? []);
  readonly citaDetalle = computed(() => this.displayCitas().find((c) => c.id === this.detalleId()) ?? null);

  // Horas para el grid (8:00 AM a 7:00 PM)
  readonly hours = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => `${String(i + HORA_INICIO).padStart(2, '0')}:00`);

  private readonly sinCitas: readonly Cita[] = [];
  citasDelDia(dia: string): readonly Cita[] {
    return this.porDia().get(dia) ?? this.sinCitas;
  }

  ngOnInit(): void {
    this.setupRealtimeSubscription();
    void this.whatsapp.preloadPlantillas();
    this.timerAhora = setInterval(() => this.ahora.set(new Date()), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerAhora);
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
  }

  private setupRealtimeSubscription(): void {
    const user = this.authService.user();
    if (!user) return;

    this.realtimeChannel = supabase
      .channel('citas-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `odontologo_id=eq.${user.id}` }, () => {
        this.refreshTrigger.update((n) => n + 1);
        this.localCitasOverride.set({});
      })
      .subscribe();
  }

  setView(view: VistaAgenda | null): void {
    if (view) this.currentView.set(view);
  }

  changeDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.value) {
      this.selectedDate.set(input.value);
    }
  }

  prev(): void {
    this.selectedDate.set(desplazar(this.currentView(), this.selectedDate(), -1));
  }

  next(): void {
    this.selectedDate.set(desplazar(this.currentView(), this.selectedDate(), 1));
  }

  goToday(): void {
    this.selectedDate.set(hoyBogota());
  }

  selectMonthDay(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.currentView.set('dia');
  }

  openCitaForm(cita?: Cita, customTime?: string, customDate?: string): void {
    const targetTime = customTime ? `${customTime}:00` : '09:00:00';
    const targetDate = customDate || this.selectedDate();

    this.citaModal()?.open(cita || {
      paciente_id: '',
      fecha_hora: `${targetDate}T${targetTime}`,
      duracion_minutos: 30,
      tipo_tratamiento: '',
      estado: 'pendiente',
      canal_origen: 'manual'
    });
  }

  verDetalle(cita: Cita): void {
    if (!cita.id) return;
    this.detalleId.set(cita.id);
    this.detalleAbierto.set(true);
  }

  editarDesdeDetalle(cita: Cita): void {
    this.detalleAbierto.set(false);
    this.openCitaForm(cita);
  }

  /** Solicita confirmación antes de cancelar (acción destructiva) */
  requestCancel(cita: Cita): void {
    this.detalleAbierto.set(false);
    this.citaPendingCancel.set(cita);
    this.confirmModal()?.open();
  }

  /** Confirma la cancelación y aplica el cambio de estado */
  confirmCancel(): void {
    const cita = this.citaPendingCancel();
    if (cita) {
      void this.updateCitaEstado(cita, 'cancelada');
    }
    this.citaPendingCancel.set(null);
  }

  /** Mensaje WhatsApp al paciente; render, URL y registro viven en WhatsappService. */
  enviarWhatsApp(cita: Cita, tipo: Extract<TipoPlantilla, 'confirmacion' | 'recordatorio'> = 'recordatorio'): void {
    void this.whatsapp.enviar({
      paciente: {
        id: cita.paciente_id,
        nombre_completo: cita.paciente?.nombre_completo ?? '',
        telefono: cita.paciente?.telefono ?? null,
      },
      tipo,
      cita: { id: cita.id, fecha_hora: cita.fecha_hora },
    });
  }

  async updateCitaEstado(cita: Cita, nuevoEstado: EstadoCita): Promise<void> {
    if (!cita.id) return;

    // Optimistic Update
    this.localCitasOverride.update((prev) => ({ ...prev, [cita.id!]: nuevoEstado }));

    try {
      await this.citaService.saveCita({ ...cita, estado: nuevoEstado });
    } catch (err) {
      console.error('Error al actualizar estado en Supabase, realizando rollback:', err);
      this.localCitasOverride.update((prev) => {
        const next = { ...prev };
        delete next[cita.id!];
        return next;
      });
    }
  }

  onSaveSuccess(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}
