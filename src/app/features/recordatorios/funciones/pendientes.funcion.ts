import { Cita } from '../../../core/services/cita.service';

const ESTADOS_EXCLUIDOS: Cita['estado'][] = ['cancelada', 'no_asistio', 'atendida'];

/** Citas activas sin recordatorio enviado, ordenadas por hora. */
export function filtrarPendientes(citas: Cita[], enviados: Set<string>): Cita[] {
  return citas
    .filter((c) => !ESTADOS_EXCLUIDOS.includes(c.estado) && !(c.id && enviados.has(c.id)))
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));
}
