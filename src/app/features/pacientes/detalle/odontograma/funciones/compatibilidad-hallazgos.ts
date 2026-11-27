import type { MarcaDiente } from '../../../../../core/services/odontograma.service';

/** Marcas que no pueden coexistir con 'ausente' (contrato plan 26). */
const EXCLUYEN_AUSENTE: MarcaDiente[] = ['corona_acero', 'endo_realizada', 'endo_indicada', 'sellante_indicado', 'nucleo', 'sano'];

function hayConflicto(a: MarcaDiente, b: MarcaDiente): boolean {
  if (a === b) return false;
  if (a === 'sano' || b === 'sano') return true;
  if (a === 'ausente') return EXCLUYEN_AUSENTE.includes(b);
  if (b === 'ausente') return EXCLUYEN_AUSENTE.includes(a);
  return a.startsWith('endo_') && b.startsWith('endo_');
}

/** Marcas actuales que habría que retirar al agregar `nuevo`. */
export function conflictos(marcasActuales: MarcaDiente[], nuevo: MarcaDiente): MarcaDiente[] {
  return marcasActuales.filter((m) => hayConflicto(m, nuevo));
}

/** Resultado de alternar `marca`: quita si estaba; si no, agrega sin duplicar y retira conflictos. */
export function aplicarToggle(marcasActuales: MarcaDiente[], marca: MarcaDiente): MarcaDiente[] {
  if (marcasActuales.includes(marca)) return marcasActuales.filter((m) => m !== marca);
  const chocan = conflictos(marcasActuales, marca);
  return [...marcasActuales.filter((m) => !chocan.includes(m)), marca];
}
