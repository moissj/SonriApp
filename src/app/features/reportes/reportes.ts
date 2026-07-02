import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ChartConfiguration } from 'chart.js';
import {
  ReporteService,
  CitasPorEstado,
  PacienteInactivo,
} from '../../core/services/reporte.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CardComponent } from '../../shared/components/card/card';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ChartComponent } from '../../shared/components/chart/chart';

const ESTADO_META: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b' },
  confirmada: { label: 'Confirmada', color: '#0ea5e9' },
  atendida: { label: 'Atendida', color: '#10b981' },
  cancelada: { label: 'Cancelada', color: '#ef4444' },
  no_asistio: { label: 'No asistió', color: '#f97316' },
};

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [RouterLink, CopCurrencyPipe, CardComponent, EmptyStateComponent, ChartComponent],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesComponent {
  private readonly reporteService = inject(ReporteService);
  private readonly cop = new CopCurrencyPipe();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly citasPorEstado = signal<CitasPorEstado[]>([]);
  readonly facturadoMes = signal(0);
  readonly cobradoMes = signal(0);
  readonly pacientesInactivos = signal<PacienteInactivo[]>([]);

  readonly mesLabel = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  readonly porCobrar = computed(() => Math.max(0, this.facturadoMes() - this.cobradoMes()));

  /** Gráfico de barras: citas por estado (Chart.js) */
  readonly citasChart = computed<ChartConfiguration>(() => {
    const data = this.citasPorEstado();
    return {
      type: 'bar',
      data: {
        labels: data.map((c) => ESTADO_META[c.estado]?.label ?? c.estado),
        datasets: [
          {
            data: data.map((c) => c.count),
            backgroundColor: data.map((c) => ESTADO_META[c.estado]?.color ?? '#94a3b8'),
            borderRadius: 6,
            maxBarThickness: 64,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } },
        },
      },
    };
  });

  /** Gráfico dona: cobrado vs por cobrar del mes (Chart.js) */
  readonly facturacionChart = computed<ChartConfiguration>(() => {
    const cop = this.cop;
    return {
      type: 'doughnut',
      data: {
        labels: ['Cobrado', 'Por cobrar'],
        datasets: [
          {
            data: [this.cobradoMes(), this.porCobrar()],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${cop.transform(ctx.parsed as number)}`,
            },
          },
        },
      },
    };
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const r = await this.reporteService.getReporteMensual();
      this.citasPorEstado.set(r.citasPorEstado);
      this.facturadoMes.set(r.facturadoMes);
      this.cobradoMes.set(r.cobradoMes);
      this.pacientesInactivos.set(r.pacientesInactivos);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      this.error.set('No se pudieron cargar los reportes.');
    } finally {
      this.loading.set(false);
    }
  }

  formatFecha(iso: string | null): string {
    return iso
      ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Nunca';
  }

  // --- Exportación CSV (en el cliente) ---

  exportarCitasPorEstado(): void {
    const rows = [
      ['Estado', 'Cantidad'],
      ...this.citasPorEstado().map((c) => [ESTADO_META[c.estado]?.label ?? c.estado, String(c.count)]),
    ];
    this.descargarCsv('citas-por-estado', rows);
  }

  exportarInactivos(): void {
    const rows = [
      ['Paciente', 'Teléfono', 'Última cita'],
      ...this.pacientesInactivos().map((p) => [p.nombre_completo, p.telefono ?? '', this.formatFecha(p.ultima_cita)]),
    ];
    this.descargarCsv('pacientes-reactivacion', rows);
  }

  exportarFacturacion(): void {
    const rows = [
      ['Concepto', 'Valor (COP)'],
      ['Facturado', String(this.facturadoMes())],
      ['Cobrado', String(this.cobradoMes())],
      ['Por cobrar', String(this.porCobrar())],
    ];
    this.descargarCsv('facturacion-mes', rows);
  }

  /** Genera y descarga un CSV a partir de filas ya cargadas en el cliente */
  private descargarCsv(nombre: string, rows: string[][]): void {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = rows.map((r) => r.map(escape).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
