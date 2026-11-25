import type { Cita } from '../../../../core/services/cita.service';

export interface DatosFaltantes {
  paciente: boolean;
  tratamiento: string | null;
  fechaHora: string | null;
  duracion: number | null;
}

export function calcularFaltantes(d: DatosFaltantes): string[] {
  const f: string[] = [];
  if (!d.paciente) f.push('Paciente');
  if (!d.tratamiento) f.push('Tratamiento');
  if (!d.fechaHora) f.push('Fecha y hora');
  if (!d.duracion || d.duracion < 5) f.push('Duración');
  return f;
}

export function textoFaltan(faltantes: string[]): string {
  return faltantes.length ? `Falta: ${faltantes.join(', ')}` : '';
}

/** Chips base + chip extra si la duración actual no está en la lista (ordenado asc). */
export function opcionesDuracion(base: number[], actual: number | null): { label: string; value: number }[] {
  const lista = actual && !base.includes(actual) ? [...base, actual].sort((a, b) => a - b) : base;
  return lista.map((m) => ({ label: `${m} min`, value: m }));
}

export function mensajeSolape(conflictos: Cita[]): string {
  if (conflictos.length === 0) return '';
  const detalle = conflictos.map((c) => {
    const date = new Date(c.fecha_hora);
    const h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    const hora = (h % 12 || 12).toString().padStart(2, '0');
    return `${c.paciente?.nombre_completo || 'Paciente'} a las ${hora}:${min} ${h >= 12 ? 'PM' : 'AM'}`;
  }).join(', ');
  return `Conflicto de Horario: ya existe una cita agendada en este rango con: ${detalle}.`;
}

export function construirCita(
  id: string | null,
  pacienteId: string,
  v: { fecha_hora?: string | null; duracion_minutos?: number | null; tipo_tratamiento?: string | null; estado?: Cita['estado'] | null; notas?: string | null; canal_origen?: Cita['canal_origen'] | null },
): Cita {
  return {
    id: id || undefined,
    paciente_id: pacienteId,
    fecha_hora: new Date(v.fecha_hora!).toISOString(),
    duracion_minutos: Number(v.duracion_minutos),
    tipo_tratamiento: v.tipo_tratamiento!,
    estado: v.estado!,
    notas: v.notas || '',
    canal_origen: v.canal_origen || 'manual',
  };
}

/** Valores del formulario: de una cita existente o por defecto (con hora precargada si viene en `cita`). */
export function valoresFormulario(cita: Partial<Cita> | undefined, duracionDefecto: number) {
  return {
    fecha_hora: cita?.fecha_hora ? cita.fecha_hora.slice(0, 16) : '',
    duracion_minutos: cita?.duracion_minutos || duracionDefecto,
    tipo_tratamiento: cita?.tipo_tratamiento ?? '',
    estado: cita?.estado ?? 'pendiente',
    notas: cita?.notas || '',
    canal_origen: cita?.canal_origen ?? 'manual',
  } as const;
}
