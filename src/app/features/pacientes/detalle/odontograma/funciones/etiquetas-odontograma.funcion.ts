import type { EstadoDiente, SuperficieDiente } from '../../../../../core/services/odontograma.service';
import { hallazgoPorEstado } from './catalogo-hallazgos';
import { esAnterior } from './geometria-odontograma.funcion';

const ETIQUETA_SUPERFICIE: Record<SuperficieDiente, string> = {
  vestibular: 'Vestibular',
  lingual_palatina: 'Lingual / Palatino',
  mesial: 'Mesial',
  distal: 'Distal',
  oclusal_incisal: 'Oclusal / Incisal',
  cervical_vestibular: 'Cervical vestibular',
  cervical_lingual_palatina: 'Cervical lingual / palatino',
  cervical_mesial: 'Cervical mesial',
  cervical_distal: 'Cervical distal',
};

/** Estados heredados que ya no se ofrecen (ahora son marca/figura) pero pueden existir en datos. */
const ETIQUETA_LEGADO: Partial<Record<EstadoDiente, string>> = {
  sano: 'Sin hallazgo',
  obturado: 'Obturado (legado)',
  corona: 'Corona (legado)',
  endodoncia: 'Endodoncia (legado)',
};

/** Nombre accesible de una zona: pieza + superficie + hallazgo */
export function etiquetaZona(fdi: string, superficie: SuperficieDiente, estado: EstadoDiente): string {
  const hallazgo = hallazgoPorEstado(estado)?.label ?? ETIQUETA_LEGADO[estado] ?? estado;
  return `Pieza ${fdi}, ${ETIQUETA_SUPERFICIE[superficie]}: ${hallazgo}`;
}

export function tituloSuperficie(fdi: string, superficie: SuperficieDiente): string {
  const label = superficie === 'oclusal_incisal' ? (esAnterior(fdi) ? 'Incisal' : 'Oclusal') : ETIQUETA_SUPERFICIE[superficie];
  return `Pieza ${fdi} · ${label}`;
}
