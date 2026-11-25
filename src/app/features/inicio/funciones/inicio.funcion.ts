import type { ChartConfiguration } from 'chart.js';
import { CitasPorEstado } from '../../../core/services/reporte.service';
import { Cita } from '../../../core/services/cita.service';
import { ESTADO_CITA, CitaEstado, TonoEstado } from '../../../shared/estado-cita/estado-cita';

/** Hex de cada tono (alineado a tokens de tailwind.config.js) para Chart.js. */
const COLOR_TONO: Record<TonoEstado, string> = {
  warning: '#f59e0b',
  primary: '#0284c7',
  violet: '#7c3aed',
  success: '#16a34a',
  neutral: '#94a3b8',
  danger: '#dc2626',
};

/** Borde izquierdo del timeline por tono (clases estáticas para Tailwind JIT). */
export const BORDE_TONO: Record<TonoEstado, string> = {
  warning: 'border-l-amber-500',
  primary: 'border-l-primary-600',
  violet: 'border-l-violet-600',
  success: 'border-l-green-600',
  neutral: 'border-l-slate-400',
  danger: 'border-l-red-600',
};

/** (confirmadas + atendidas) / total * 100, redondeado; '—' si no hay citas. */
export function tasaConfirmacion(datos: CitasPorEstado[]): string {
  const total = datos.reduce((s, d) => s + d.count, 0);
  if (total === 0) return '—';
  const ok = datos.filter((d) => d.estado === 'confirmada' || d.estado === 'atendida').reduce((s, d) => s + d.count, 0);
  return `${Math.round((ok / total) * 100)}%`;
}

/** Primera cita con fecha_hora >= ahora y estado != cancelada (citas ya ordenadas asc). */
export function proximaCita(citas: Cita[], ahora: Date): Cita | null {
  const t = ahora.getTime();
  return citas.find((c) => c.estado !== 'cancelada' && new Date(c.fecha_hora).getTime() >= t) ?? null;
}

export function doughnutCitas(datos: CitasPorEstado[]): ChartConfiguration<'doughnut'> {
  const meta = (e: string) => ESTADO_CITA[e as CitaEstado];
  return {
    type: 'doughnut',
    data: {
      labels: datos.map((d) => meta(d.estado)?.label ?? d.estado),
      datasets: [
        {
          data: datos.map((d) => d.count),
          backgroundColor: datos.map((d) => COLOR_TONO[meta(d.estado)?.tono ?? 'neutral']),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom' } },
    },
  };
}
