import { Cita } from '../../../core/services/cita.service';

export interface CitaRecordatorio {
  cita: Cita;
  ultimoEnvio: string | null;
}

export interface DiaRecordatorios {
  fecha: string;
  pendientes: CitaRecordatorio[];
  enviados: CitaRecordatorio[];
}

const diaBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

/** Agrupa citas por día local Bogota (asc), separando enviadas y pendientes, ordenadas por hora. */
export function agruparPorDia(citas: Cita[], enviadosPorCita: Map<string, string>): DiaRecordatorios[] {
  const dias = new Map<string, DiaRecordatorios>();
  const ordenadas = [...citas].sort((a, b) => Date.parse(a.fecha_hora) - Date.parse(b.fecha_hora));
  for (const cita of ordenadas) {
    const fecha = diaBogota.format(new Date(cita.fecha_hora));
    const dia = dias.get(fecha) ?? { fecha, pendientes: [], enviados: [] };
    const ultimoEnvio = (cita.id && enviadosPorCita.get(cita.id)) || null;
    (ultimoEnvio ? dia.enviados : dia.pendientes).push({ cita, ultimoEnvio });
    dias.set(fecha, dia);
  }
  return [...dias.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}
