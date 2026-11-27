import type { OdontogramaMeta, OdontogramaTipo } from '../../../../../core/services/odontograma.service';

export const metaDe = (metas: OdontogramaMeta[], tipo: OdontogramaTipo): OdontogramaMeta | null =>
  metas.find((m) => m.tipo === tipo) ?? null;

/**
 * Solo-lectura: cerrado, meta no cargada (fail-closed) o final aún sin crear
 * (editar crearía filas finales sin meta).
 */
export function editorBloqueado(metas: OdontogramaMeta[] | null, tipo: OdontogramaTipo): boolean {
  if (!metas) return true;
  const meta = metaDe(metas, tipo);
  return meta ? meta.estado === 'cerrado' : tipo === 'final';
}
