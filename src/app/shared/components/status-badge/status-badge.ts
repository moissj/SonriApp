import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/** Estados de cita y estados de cuenta soportados por el badge */
import { CitaEstado, ESTADO_CITA, tonoAClasesBadge } from '../../estado-cita/estado-cita';
export type { CitaEstado };
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
    const e = this.estado();
    if (e in ESTADO_CITA) return ESTADO_CITA[e as CitaEstado].label;
    switch (e) {
      case 'activo': return 'Activo';
      case 'suspendido': return 'Suspendido';
      case 'vencido': return 'Vencido';
      default: return 'Desconocido';
    }
  });

  badgeClass = computed(() => {
    const base = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border';
    const e = this.estado();
    if (e in ESTADO_CITA) return `${base} ${tonoAClasesBadge(ESTADO_CITA[e as CitaEstado].tono)}`;
    switch (e) {
      case 'activo': // success
        return `${base} bg-green-50 text-green-800 border-green-200`;
      case 'suspendido': // danger
        return `${base} bg-red-50 text-red-800 border-red-200`;
      case 'vencido': // warning
        return `${base} bg-amber-50 text-amber-800 border-amber-200`;
      default:
        return `${base} bg-neutral-50 text-neutral-800 border-neutral-200`;
    }
  });
}
