import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/** Estados de cita y estados de cuenta soportados por el badge */
export type CitaEstado = 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio';
export type CuentaEstado = 'activo' | 'suspendido' | 'vencido';
export type BadgeEstado = CitaEstado | CuentaEstado;

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  estado = input.required<BadgeEstado>();

  label = computed(() => {
    switch (this.estado()) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'atendida': return 'Atendida';
      case 'cancelada': return 'Cancelada';
      case 'no_asistio': return 'No asistió';
      case 'activo': return 'Activo';
      case 'suspendido': return 'Suspendido';
      case 'vencido': return 'Vencido';
      default: return 'Desconocido';
    }
  });

  badgeClass = computed(() => {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border';
    switch (this.estado()) {
      case 'pendiente':
        return `${base} bg-yellow-50 text-yellow-800 border-yellow-200`;
      case 'confirmada':
        return `${base} bg-blue-50 text-blue-800 border-blue-200`;
      case 'atendida':
      case 'activo': // success
        return `${base} bg-green-50 text-green-800 border-green-200`;
      case 'cancelada':
      case 'no_asistio':
      case 'suspendido': // danger
        return `${base} bg-red-50 text-red-800 border-red-200`;
      case 'vencido': // warning
        return `${base} bg-amber-50 text-amber-800 border-amber-200`;
      default:
        return `${base} bg-neutral-50 text-neutral-800 border-neutral-200`;
    }
  });
}
