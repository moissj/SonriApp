/** Aditivo: 'en_atencion' se agregó al union; en BD `estado_cita_enum` se maneja como string. */
export type CitaEstado = 'pendiente' | 'confirmada' | 'en_atencion' | 'atendida' | 'cancelada' | 'no_asistio';

export type TonoEstado = 'warning' | 'primary' | 'violet' | 'success' | 'neutral' | 'danger';

/** Única fuente de verdad: estado de cita → label, tono e icono Lucide (por nombre). */
export const ESTADO_CITA: Record<CitaEstado, { label: string; tono: TonoEstado; icono: string }> = {
  pendiente: { label: 'Pendiente', tono: 'warning', icono: 'clock' },
  confirmada: { label: 'Confirmada', tono: 'primary', icono: 'calendar-check' },
  en_atencion: { label: 'En atención', tono: 'violet', icono: 'activity' },
  atendida: { label: 'Atendida', tono: 'success', icono: 'check-circle' },
  cancelada: { label: 'Cancelada', tono: 'neutral', icono: 'x-circle' },
  no_asistio: { label: 'No asistió', tono: 'danger', icono: 'user-x' },
};

const CLASES_TONO: Record<TonoEstado, string> = {
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
};

/** Clases Tailwind (bg/text/border) del badge pill según tono. */
export function tonoAClasesBadge(tono: TonoEstado): string {
  return CLASES_TONO[tono];
}
