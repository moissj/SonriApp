import type { CambioAuditoria, EstadoDiente, MarcaDiente, PiezaOdontograma, SuperficieDiente } from '../../../../../core/services/odontograma.service';
import { hallazgoPorEstado } from './catalogo-hallazgos';

/** Marca presente (true) o ausente (false) en la pieza. */
export type MarcaPresente = boolean;

/** Operación atómica e invertible. fill: antes/despues = estado de la superficie ('sano' = sin hallazgo). */
export interface OpEdicion {
  clase: 'marca' | 'fill';
  pieza: string;
  hallazgoId: string;
  superficie?: string;
  antes: EstadoDiente | null | MarcaPresente;
  despues: EstadoDiente | null | MarcaPresente;
  /** Ops de una misma acción lógica (p. ej. marca + retiro de excluyentes) comparten grupo y se deshacen juntas. */
  grupo?: number;
}

export const LIMITE_PILA = 50;

export const invertir = (op: OpEdicion): OpEdicion => ({ ...op, antes: op.despues, despues: op.antes });

/** Pila deshacer/rehacer pura; al exceder el límite descarta las más viejas. */
export class PilaEdicion {
  private hechas: OpEdicion[] = [];
  private deshechas: OpEdicion[] = [];
  constructor(private readonly limite = LIMITE_PILA) {}

  get puedeUndo(): boolean { return this.hechas.length > 0; }
  get puedeRedo(): boolean { return this.deshechas.length > 0; }

  push(op: OpEdicion): void {
    this.hechas.push(op);
    if (this.hechas.length > this.limite) this.hechas.shift();
    this.deshechas = [];
  }

  undo(): OpEdicion | null {
    const op = this.hechas.pop() ?? null;
    if (op) this.deshechas.push(op);
    return op;
  }

  redo(): OpEdicion | null {
    const op = this.deshechas.pop() ?? null;
    if (op) this.hechas.push(op);
    return op;
  }

  /** Deshace todas las ops contiguas del mismo grupo (o una sola si no tiene grupo). */
  undoGrupo(): OpEdicion[] {
    const primera = this.undo();
    if (!primera) return [];
    const out = [primera];
    while (primera.grupo !== undefined && this.hechas.at(-1)?.grupo === primera.grupo) out.push(this.undo() as OpEdicion);
    return out;
  }

  redoGrupo(): OpEdicion[] {
    const primera = this.redo();
    if (!primera) return [];
    const out = [primera];
    while (primera.grupo !== undefined && this.deshechas.at(-1)?.grupo === primera.grupo) out.push(this.redo() as OpEdicion);
    return out;
  }
}

/** Entradas de auditoría de una op ya orientada (despues = estado resultante). */
export function auditoriaDeOp(op: OpEdicion): Omit<CambioAuditoria, 'tipo'>[] {
  const base = { pieza: op.pieza, superficie: op.superficie };
  if (op.clase === 'marca') return [{ ...base, hallazgoId: op.hallazgoId, accion: op.despues ? 'agrega' : 'quita' }];
  const out: Omit<CambioAuditoria, 'tipo'>[] = [];
  const antes = hallazgoPorEstado(op.antes as EstadoDiente);
  const despues = hallazgoPorEstado(op.despues as EstadoDiente);
  if (antes) out.push({ ...base, hallazgoId: antes.id, accion: 'quita' });
  if (despues) out.push({ ...base, hallazgoId: despues.id, accion: 'agrega' });
  return out;
}

export type MapaSuperficies = Record<string, PiezaOdontograma>;

/** Nuevo mapa con el estado de una superficie (registro provisional si aún no existe). */
export function conEstado(mapa: MapaSuperficies, pacienteId: string, pieza: string, superficie: SuperficieDiente, estado: EstadoDiente): MapaSuperficies {
  const k = `${pieza}:${superficie}`;
  const base = mapa[k] ?? { id: '', odontologo_id: '', paciente_id: pacienteId, pieza, superficie, estado, notas: null, fecha: '' };
  return { ...mapa, [k]: { ...base, estado } };
}

/** Nuevo mapa de marcas con `marca` presente/ausente en la pieza (sin duplicar). */
export function conMarca(mapa: Map<string, MarcaDiente[]>, pieza: string, marca: MarcaDiente, presente: boolean): Map<string, MarcaDiente[]> {
  const sin = (mapa.get(pieza) ?? []).filter((m) => m !== marca);
  return new Map(mapa).set(pieza, presente ? [...sin, marca] : sin);
}
