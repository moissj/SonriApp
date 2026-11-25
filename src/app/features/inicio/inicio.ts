import { LucideAngularModule } from 'lucide-angular';
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import type { ChartConfiguration } from 'chart.js';
import { ProfileService } from '../../core/services/profile.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ReporteService, CitasPorEstado } from '../../core/services/reporte.service';
import { Cita } from '../../core/services/cita.service';
import { fechaLargaBogota } from '../../core/funciones/fecha-bogota.funcion';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../shared/components/card/card';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ChartComponent } from '../../shared/components/chart/chart';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { ESTADO_CITA } from '../../shared/estado-cita/estado-cita';
import { BORDE_TONO, doughnutCitas, proximaCita, tasaConfirmacion } from './funciones/inicio.funcion';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, DatePipe, CopCurrencyPipe, CardComponent, StatusBadgeComponent, PageHeaderComponent, ChartComponent, KpiCard],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioComponent {
  private readonly profileService = inject(ProfileService);
  private readonly dashboardService = inject(DashboardService);
  private readonly reporteService = inject(ReporteService);

  readonly profile = this.profileService.profile;
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly citasHoy = signal<Cita[]>([]);
  readonly proximas7 = signal(0);
  readonly pacientesNuevosMes = signal(0);
  readonly saldoPendiente = signal(0);

  /** null = aún sin datos o error de ReporteService (la UI muestra '—'). */
  readonly citasPorEstado = signal<CitasPorEstado[] | null>(null);
  readonly cobradoMes = signal<number | null>(null);

  readonly siguiente = computed(() => proximaCita(this.citasHoy(), new Date()));
  readonly tasa = computed(() => {
    const d = this.citasPorEstado();
    return d ? tasaConfirmacion(d) : '—';
  });
  readonly hayDatosGrafico = computed(() => (this.citasPorEstado() ?? []).some((d) => d.count > 0));
  readonly donaConfig = computed<ChartConfiguration<'doughnut'>>(() => doughnutCitas(this.citasPorEstado() ?? []));

  readonly estadoCita = ESTADO_CITA;
  readonly bordeTono = BORDE_TONO;

  readonly firstName = computed(() => this.profile()?.nombre_completo?.trim().split(/\s+/)[0] ?? '');

  readonly todayLabel = computed(() =>
    fechaLargaBogota(new Date())
  );

  constructor() {
    this.loadDashboard();
    this.loadReporte();
  }

  private async loadDashboard(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.dashboardService.getResumen();
      this.citasHoy.set(data.citasHoy);
      this.proximas7.set(data.proximas7);
      this.pacientesNuevosMes.set(data.pacientesNuevosMes);
      this.saldoPendiente.set(data.saldoPendiente);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadReporte(): Promise<void> {
    try {
      const r = await this.reporteService.getReporteMensual();
      this.citasPorEstado.set(r.citasPorEstado);
      this.cobradoMes.set(r.cobradoMes);
    } catch {
      this.citasPorEstado.set(null);
      this.cobradoMes.set(null);
    }
  }
}
