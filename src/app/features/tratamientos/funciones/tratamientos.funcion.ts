import type { Tratamiento } from '../../../core/services/tratamiento.service';

export type FiltroEstado = 'todos' | 'activos' | 'inactivos';

const promedio = (valores: number[]): number =>
  valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;

export const precioPromedio = (l: Tratamiento[]): number => promedio(l.map((t) => t.precio_base));
export const duracionPromedio = (l: Tratamiento[]): number => promedio(l.map((t) => t.duracion_minutos));
export const contarActivos = (l: Tratamiento[]): number => l.filter((t) => t.activo).length;

/** Filtra por estado y por texto (nombre/descripción, sin tildes ni mayúsculas). */
export function filtrarTratamientos(l: Tratamiento[], estado: FiltroEstado, texto: string): Tratamiento[] {
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = norm(texto.trim());
  return l.filter((t) => {
    if (estado === 'activos' && !t.activo) return false;
    if (estado === 'inactivos' && t.activo) return false;
    return !q || norm(t.nombre).includes(q) || norm(t.descripcion ?? '').includes(q);
  });
}
