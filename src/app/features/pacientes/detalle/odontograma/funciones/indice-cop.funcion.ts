import type { EstadoDiente, MarcaDiente } from '../../../../../core/services/odontograma.service';

export interface EntradaIndice {
  superficies: { pieza: string; estado: EstadoDiente }[];
  marcas: Map<string, MarcaDiente[]>;
}
export interface IndiceCop { C: number; O: number; P: number; total: number }
export interface IndiceCeo { c: number; e: number; o: number; total: number }

const OBTURADOS: EstadoDiente[] = ['obturado', 'resina', 'amalgama', 'obt_desadaptada'];

/** Temporales: FDI 51-85 (primer dígito 5-8). */
export const esTemporal = (fdi: string): boolean => /^[5-8]/.test(fdi);

type Clase = 'cariado' | 'obturado' | 'perdido' | 'extraccion' | null;

function claseDe(fdi: string, estados: EstadoDiente[], marcas: MarcaDiente[]): Clase {
  const temporal = esTemporal(fdi);
  const ausente = estados.includes('ausente') || marcas.includes('ausente');
  // Temporal ausente no cuenta (exfoliación natural); permanente ausente o con exodoncia indicada = perdido.
  if (temporal && marcas.includes('exodoncia_indicada')) return 'extraccion';
  if (!temporal && (ausente || marcas.includes('exodoncia_indicada'))) return 'perdido';
  if (temporal && ausente) return null;
  if (estados.includes('caries')) return 'cariado';
  if (estados.some((e) => OBTURADOS.includes(e)) || (temporal && marcas.includes('obt_temporal'))) return 'obturado';
  return null;
}

/** COP (permanentes) y ceo (temporales): cada diente cuenta una sola vez, con prioridad perdido > cariado > obturado. */
export function calcularIndices(entrada: EntradaIndice): { cop: IndiceCop; ceo: IndiceCeo } {
  const estadosPor = new Map<string, EstadoDiente[]>();
  for (const s of entrada.superficies) estadosPor.set(s.pieza, [...(estadosPor.get(s.pieza) ?? []), s.estado]);
  const piezas = new Set([...estadosPor.keys(), ...entrada.marcas.keys()]);
  const cop: IndiceCop = { C: 0, O: 0, P: 0, total: 0 };
  const ceo: IndiceCeo = { c: 0, e: 0, o: 0, total: 0 };
  for (const p of piezas) {
    const clase = claseDe(p, estadosPor.get(p) ?? [], entrada.marcas.get(p) ?? []);
    if (!clase) continue;
    if (esTemporal(p)) {
      if (clase === 'cariado') ceo.c++; else if (clase === 'extraccion') ceo.e++; else ceo.o++;
      ceo.total++;
    } else {
      if (clase === 'cariado') cop.C++; else if (clase === 'obturado') cop.O++; else cop.P++;
      cop.total++;
    }
  }
  return { cop, ceo };
}
