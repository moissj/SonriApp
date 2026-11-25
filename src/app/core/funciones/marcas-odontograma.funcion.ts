import type { MarcaDiente, MarcaOdontograma } from '../services/odontograma.service';

/** Fila cruda de `odontograma_marcas` -> tipo de dominio (normaliza nulos). */
export function filaAMarca(fila: Record<string, unknown>): MarcaOdontograma {
  return {
    id: String(fila['id']),
    odontologo_id: String(fila['odontologo_id']),
    paciente_id: String(fila['paciente_id']),
    pieza: String(fila['pieza']),
    marca: fila['marca'] as MarcaDiente,
    notas: (fila['notas'] as string | null | undefined) ?? null,
    fecha: String(fila['fecha']),
    ...(fila['updated_at'] ? { updated_at: String(fila['updated_at']) } : {}),
  };
}

/** Agrupa las marcas por pieza (p. ej. "11" -> ['nucleo', 'corona_acero']). */
export function agruparMarcasPorPieza(marcas: MarcaOdontograma[]): Map<string, MarcaDiente[]> {
  const mapa = new Map<string, MarcaDiente[]>();
  for (const m of marcas) {
    const lista = mapa.get(m.pieza) ?? [];
    lista.push(m.marca);
    mapa.set(m.pieza, lista);
  }
  return mapa;
}
