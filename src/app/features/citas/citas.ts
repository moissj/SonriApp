import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, OnInit, OnDestroy, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { CitaModalComponent } from './cita-modal/cita-modal';
import { aFechaBogota, hoyBogota } from '../../core/funciones/fecha-bogota.funcion';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, DatePipe, StatusBadgeComponent, ConfirmModalComponent, CitaModalComponent],
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
  readonly currentView = signal<'dia' | 'semana' | 'mes'>('dia');
  readonly refreshTrigger = signal<number>(0);
  readonly activeMenuCita = signal<Cita | null>(null);

  /** Cita pendiente de confirmar cancelación (acción destructiva) */
  readonly citaPendingCancel = signal<Cita | null>(null);

  // Registro de overrides locales para Optimistic Updates
  readonly localCitasOverride = signal<Record<string, 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'>>({});

  readonly citaModal = viewChild(CitaModalComponent);
  readonly confirmModal = viewChild(ConfirmModalComponent);

  private realtimeChannel: any;

  // Rango de la semana del selectedDate (Lunes - Domingo)
  readonly weekRange = computed(() => {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    const day = d.getDay(); // 0 es Domingo, 1 es Lunes
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { monday, sunday };
  });

  // Array de fechas de la semana actual para la vista semanal
  readonly weekDates = computed(() => {
    const { monday } = this.weekRange();
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  });

  // Cabeceras de la semana (Español)
  readonly weekHeaders = computed(() => {
    const dates = this.weekDates();
    const daysSpanish = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dates.map((date) => {
      const dayName = daysSpanish[date.getDay()];
      const dayNum = date.getDate();
      const dateStr = aFechaBogota(date);
      return {
        label: `${dayName} ${dayNum}`,
        dateStr,
      };
    });
  });

  // Array de 42 celdas para la cuadrícula del mes
  readonly monthDates = computed(() => {
    const d = new Date(this.selectedDate() + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes
    
    // Cuántos días restar para llegar al primer Lunes de la cuadrícula
    const diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(firstDay.getDate() + diff);
    
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startCalendar);
      cellDate.setDate(startCalendar.getDate() + i);
      dates.push(cellDate);
    }
    return dates;
  });

  // Celdas del mes mapeadas con metadatos
  readonly monthCells = computed(() => {
    const dates = this.monthDates();
    const activeDate = new Date(this.selectedDate() + 'T00:00:00');
    const currentMonth = activeDate.getMonth();
    const todayStr = hoyBogota();

    return dates.map((date) => {
      const dateStr = aFechaBogota(date);
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isToday = dateStr === todayStr;
      return {
        date,
        dayNum: date.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
      };
    });
  });

  // Rango de fechas a consultar dependiendo de la vista activa
  readonly fetchRange = computed(() => {
    const view = this.currentView();
    const dateStr = this.selectedDate();
    
    if (view === 'dia') {
      return {
        start: `${dateStr}T00:00:00.000Z`,
        end: `${dateStr}T23:59:59.999Z`
      };
    } else if (view === 'semana') {
      const { monday, sunday } = this.weekRange();
      const mondayStr = monday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];
      return {
        start: `${mondayStr}T00:00:00.000Z`,
        end: `${sundayStr}T23:59:59.999Z`
      };
    } else {
      const dates = this.monthDates();
      const startStr = dates[0].toISOString().split('T')[0];
      const endStr = dates[41].toISOString().split('T')[0];
      return {
        start: `${startStr}T00:00:00.000Z`,
        end: `${endStr}T23:59:59.999Z`
      };
    }
  });

  // Texto del rango de fecha actual (estilo Teams)
  readonly dateRangeText = computed(() => {
    const view = this.currentView();
    const dateStr = this.selectedDate();
    const d = new Date(dateStr + 'T00:00:00');
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    
    if (view === 'dia') {
      return d.toLocaleDateString('es-ES', options);
    } else if (view === 'semana') {
      const { monday, sunday } = this.weekRange();
      const startDay = monday.getDate();
      const startMonth = monday.toLocaleDateString('es-ES', { month: 'short' });
      const endDay = sunday.getDate();
      const endMonth = sunday.toLocaleDateString('es-ES', { month: 'short' });
      const year = sunday.getFullYear();
      return `${startDay} de ${startMonth} - ${endDay} de ${endMonth}, ${year}`;
    } else {
      const monthName = d.toLocaleDateString('es-ES', { month: 'long' });
      const year = d.getFullYear();
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
    }
  });

  // Cargar citas reactivas
  readonly citas = toSignal(
    toObservable(computed(() => {
      return { range: this.fetchRange(), trigger: this.refreshTrigger() };
    })).pipe(
      switchMap(({ range }) => {
        return from(this.citaService.getCitas(range.start, range.end));
      })
    ),
    { initialValue: [] as Cita[] }
  );

  // Mezclar citas con los overrides locales de estado
  readonly displayCitas = computed(() => {
    const raw = this.citas();
    const overrides = this.localCitasOverride();
    return raw.map((c) => {
      if (c.id && overrides[c.id]) {
        return { ...c, estado: overrides[c.id] };
      }
      return c;
    });
  });

  // Citas del día seleccionado (útil en vista mensual móvil)
  readonly selectedDayCitas = computed(() => {
    const dateStr = this.selectedDate();
    return this.displayCitas().filter((cita) => {
      return cita.fecha_hora.split('T')[0] === dateStr;
    });
  });

  // Horas para el grid (8:00 AM a 7:00 PM)
  readonly hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 8;
    return h < 10 ? `0${h}:00` : `${h}:00`;
  });

  ngOnInit(): void {
    this.setupRealtimeSubscription();
    void this.whatsapp.preloadPlantillas();
  }

  ngOnDestroy(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
  }

  private setupRealtimeSubscription(): void {
    const user = this.authService.user();
    if (!user) return;

    this.realtimeChannel = supabase
      .channel('citas-realtime-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citas',
          filter: `odontologo_id=eq.${user.id}`,
        },
        () => {
          this.refreshTrigger.update((n) => n + 1);
          this.localCitasOverride.set({});
        }
      )
      .subscribe();
  }

  setView(view: 'dia' | 'semana' | 'mes'): void {
    this.currentView.set(view);
  }

  changeDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.value) {
      this.selectedDate.set(input.value);
    }
  }

  prev(): void {
    const view = this.currentView();
    const d = new Date(this.selectedDate() + 'T00:00:00');
    if (view === 'dia') {
      d.setDate(d.getDate() - 1);
    } else if (view === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    this.selectedDate.set(d.toISOString().split('T')[0]);
  }

  next(): void {
    const view = this.currentView();
    const d = new Date(this.selectedDate() + 'T00:00:00');
    if (view === 'dia') {
      d.setDate(d.getDate() + 1);
    } else if (view === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    this.selectedDate.set(d.toISOString().split('T')[0]);
  }

  goToday(): void {
    this.selectedDate.set(hoyBogota());
  }

  selectMonthDay(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.currentView.set('dia');
  }

  openCitaForm(cita?: Cita, customTime?: string, customDate?: string): void {
    let targetTime = '09:00:00';
    if (customTime) {
      targetTime = `${customTime}:00`;
    }
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

  openMenu(cita: Cita, event: Event): void {
    event.stopPropagation();
    this.activeMenuCita.set(cita);
  }

  closeMenu(): void {
    this.activeMenuCita.set(null);
  }

  /** Solicita confirmación antes de cancelar (acción destructiva) */
  requestCancel(cita: Cita): void {
    this.closeMenu();
    this.citaPendingCancel.set(cita);
    this.confirmModal()?.open();
  }

  /** Confirma la cancelación y aplica el cambio de estado */
  confirmCancel(): void {
    const cita = this.citaPendingCancel();
    if (cita) {
      this.updateCitaEstado(cita, 'cancelada');
    }
    this.citaPendingCancel.set(null);
  }

  /**
   * Envía un mensaje por WhatsApp al paciente usando la plantilla indicada.
   * Toda la lógica vive en WhatsappService (render + URL + registro).
   */
  enviarWhatsApp(cita: Cita, tipo: Extract<TipoPlantilla, 'confirmacion' | 'recordatorio'>): void {
    void this.whatsapp.enviar({
      paciente: {
        id: cita.paciente_id,
        nombre_completo: cita.paciente?.nombre_completo ?? '',
        telefono: cita.paciente?.telefono ?? null,
      },
      tipo,
      cita: { id: cita.id, fecha_hora: cita.fecha_hora },
    });
    this.closeMenu();
  }

  async updateCitaEstado(cita: Cita, nuevoEstado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio'): Promise<void> {
    if (!cita.id) return;
    this.closeMenu();

    // Optimistic Update
    this.localCitasOverride.update((prev) => ({
      ...prev,
      [cita.id!]: nuevoEstado,
    }));

    try {
      await this.citaService.saveCita({
        ...cita,
        estado: nuevoEstado,
      });
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
