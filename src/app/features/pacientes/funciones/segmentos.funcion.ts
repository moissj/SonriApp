import { aFechaBogota } from '../../../core/funciones/fecha-bogota.funcion';

export type SegmentoPaciente = 'todos' | 'activos' | 'inactivos';

/** Activo = última cita (pasada) dentro de los últimos 6 meses. */
export function esActivo(ultimaCita: string | null | undefined, ahora: Date = new Date()): boolean {
  if (!ultimaCita) return false;
  const limite = new Date(ahora);
  limite.setMonth(limite.getMonth() - 6);
  return new Date(ultimaCita) >= limite;
}

export function enSegmento<T extends { ultima_cita?: string | null }>(
  pacientes: T[], segmento: SegmentoPaciente, ahora: Date = new Date(),
): T[] {
  if (segmento === 'todos') return pacientes;
  return pacientes.filter((p) => esActivo(p.ultima_cita, ahora) === (segmento === 'activos'));
}

/** ¿`createdAt` cae en el mismo mes calendario (America/Bogota) que `ahora`? */
export function esDelMesActual(createdAt: string | undefined, ahora: Date = new Date()): boolean {
  if (!createdAt) return false;
  return aFechaBogota(new Date(createdAt)).slice(0, 7) === aFechaBogota(ahora).slice(0, 7);
}
