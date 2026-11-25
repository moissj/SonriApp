import { CitaEstado, ESTADO_CITA, TonoEstado } from '../../../shared/estado-cita/estado-cita';

export const HORA_INICIO = 8;
export const HORA_FIN = 20;
export const PX_POR_HORA = 80;
const PX_POR_MIN = PX_POR_HORA / 60;
const ALTO_MINIMO = 28;
const ZONA = 'America/Bogota';

/** Clases ESTÁTICAS por tono (Tailwind necesita verlas completas en el código). */
export const CLASES_TONO_CITA: Record<TonoEstado, { bloque: string; punto: string }> = {
  warning: { bloque: 'bg-amber-50 hover:bg-amber-100 border-amber-500 text-amber-900', punto: 'bg-amber-500' },
  primary: { bloque: 'bg-primary-50 hover:bg-primary-100 border-primary-500 text-primary-900', punto: 'bg-primary-500' },
  violet: { bloque: 'bg-violet-50 hover:bg-violet-100 border-violet-500 text-violet-900', punto: 'bg-violet-500' },
  success: { bloque: 'bg-green-50 hover:bg-green-100 border-green-500 text-green-900', punto: 'bg-green-500' },
  neutral: { bloque: 'bg-slate-100 hover:bg-slate-200 border-slate-400 text-slate-700', punto: 'bg-slate-400' },
  danger: { bloque: 'bg-red-50 hover:bg-red-100 border-red-500 text-red-900', punto: 'bg-red-500' },
};

export function clasesCita(estado: string): { bloque: string; punto: string } {
  const info = ESTADO_CITA[estado as CitaEstado];
  return CLASES_TONO_CITA[info ? info.tono : 'neutral'];
}

/** Minutos desde medianoche en America/Bogota. */
export function minutosBogota(iso: string | Date): number {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(typeof iso === 'string' ? new Date(iso) : iso);
  const n = (t: string) => Number(partes.find((p) => p.type === t)?.value ?? 0);
  return n('hour') * 60 + n('minute');
}

/** Posición (px) y alto proporcional a la duración; null si queda fuera de 08-20. */
export function posicionBloque(iso: string, duracionMin: number): { top: number; height: number } | null {
  const min = minutosBogota(iso);
  if (min < HORA_INICIO * 60 || min >= HORA_FIN * 60) return null;
  return {
    top: (min - HORA_INICIO * 60) * PX_POR_MIN,
    height: Math.max(duracionMin * PX_POR_MIN, ALTO_MINIMO),
  };
}

/** Posición (px) de la línea de hora actual; null fuera del rango horario. */
export function posicionAhora(ahora: Date): number | null {
  const min = minutosBogota(ahora);
  if (min < HORA_INICIO * 60 || min >= HORA_FIN * 60) return null;
  return (min - HORA_INICIO * 60) * PX_POR_MIN;
}

/** YYYY-MM-DD en Bogota de un instante. */
export function diaBogota(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date(iso));
}

export function horaBogota(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date(iso));
}

export function fechaHoraBogota(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}

/** Agrupa por día (Bogota) y ordena cronológicamente. */
export function agruparPorDia<T extends { fecha_hora: string }>(citas: T[]): { dia: string; citas: T[] }[] {
  const orden = [...citas].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  const grupos = new Map<string, T[]>();
  for (const c of orden) {
    const dia = diaBogota(c.fecha_hora);
    grupos.set(dia, [...(grupos.get(dia) ?? []), c]);
  }
  return [...grupos].map(([dia, lista]) => ({ dia, citas: lista }));
}
