import type { OdontogramaCierre, OdontogramaMeta, OdontogramaTipo } from '../services/odontograma.service';

/** Fila cruda de `odontograma_meta` -> tipo de dominio (normaliza nulos). */
export function filaAMeta(fila: Record<string, unknown>): OdontogramaMeta {
  return {
    id: String(fila['id']),
    odontologo_id: String(fila['odontologo_id']),
    paciente_id: String(fila['paciente_id']),
    tipo: fila['tipo'] as OdontogramaTipo,
    estado: fila['estado'] as OdontogramaCierre,
    fecha: String(fila['fecha']),
    creado_por: (fila['creado_por'] as string | null | undefined) ?? null,
    cerrado_en: (fila['cerrado_en'] as string | null | undefined) ?? null,
    notas: (fila['notas'] as string | null | undefined) ?? null,
  };
}
