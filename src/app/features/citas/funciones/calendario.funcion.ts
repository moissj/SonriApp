import { aFechaBogota } from '../../../core/funciones/fecha-bogota.funcion';

export type VistaAgenda = 'dia' | 'semana' | 'mes' | 'lista';

const SEMANA_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const sumarDias = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
};
const soloFecha = (d: Date): string => d.toISOString().split('T')[0];

/** Lunes-domingo de la semana que contiene `dateStr` (YYYY-MM-DD). */
export function rangoSemana(dateStr: string): { monday: Date; sunday: Date } {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const monday = sumarDias(d, day === 0 ? -6 : 1 - day);
  return { monday, sunday: sumarDias(monday, 6) };
}

export function fechasSemana(dateStr: string): Date[] {
  const { monday } = rangoSemana(dateStr);
  return Array.from({ length: 7 }, (_, i) => sumarDias(monday, i));
}

export function cabecerasSemana(dateStr: string): { label: string; dateStr: string }[] {
  return fechasSemana(dateStr).map((d) => ({ label: `${SEMANA_ES[d.getDay()]} ${d.getDate()}`, dateStr: aFechaBogota(d) }));
}

/** 42 celdas (6 semanas) que arrancan en el lunes previo al día 1 del mes. */
export function fechasMes(dateStr: string): Date[] {
  const d = new Date(dateStr + 'T00:00:00');
  const primero = new Date(d.getFullYear(), d.getMonth(), 1);
  const dow = primero.getDay();
  const inicio = sumarDias(primero, dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i));
}

export function celdasMes(dateStr: string, hoy: string) {
  const mes = new Date(dateStr + 'T00:00:00').getMonth();
  return fechasMes(dateStr).map((date) => {
    const ds = aFechaBogota(date);
    return { date, dayNum: date.getDate(), dateStr: ds, isCurrentMonth: date.getMonth() === mes, isToday: ds === hoy };
  });
}

/** Rango ISO a consultar; 'lista' usa la semana. */
export function rangoConsulta(vista: VistaAgenda, dateStr: string): { start: string; end: string } {
  let ini = dateStr;
  let fin = dateStr;
  if (vista === 'semana' || vista === 'lista') {
    const { monday, sunday } = rangoSemana(dateStr);
    ini = soloFecha(monday);
    fin = soloFecha(sunday);
  } else if (vista === 'mes') {
    const fechas = fechasMes(dateStr);
    ini = soloFecha(fechas[0]);
    fin = soloFecha(fechas[41]);
  }
  return { start: `${ini}T00:00:00.000Z`, end: `${fin}T23:59:59.999Z` };
}

export function textoRango(vista: VistaAgenda, dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (vista === 'dia') return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  if (vista === 'mes') {
    const mes = d.toLocaleDateString('es-ES', { month: 'long' });
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} de ${d.getFullYear()}`;
  }
  const { monday, sunday } = rangoSemana(dateStr);
  const m = (x: Date) => x.toLocaleDateString('es-ES', { month: 'short' });
  return `${monday.getDate()} de ${m(monday)} - ${sunday.getDate()} de ${m(sunday)}, ${sunday.getFullYear()}`;
}

/** Desplaza la fecha una unidad de la vista (dia: 1, semana/lista: 7, mes: 1 mes). */
export function desplazar(vista: VistaAgenda, dateStr: string, signo: 1 | -1): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (vista === 'dia') d.setDate(d.getDate() + signo);
  else if (vista === 'mes') d.setMonth(d.getMonth() + signo);
  else d.setDate(d.getDate() + 7 * signo);
  return soloFecha(d);
}
