import type { MarcaDiente } from '../../../../../core/services/odontograma.service';
import { CATALOGO_HALLAZGOS, type HallazgoDef } from './catalogo-hallazgos';

export interface ItemRecuadro {
  id: string;
  simbolo?: string;
  forma?: HallazgoDef['forma'];
  token: string;
  label: string;
  x: number;
  fontSize: number;
  /** Semi-ancho de las formas sin letra (linea/barra) */
  half: number;
}

export interface VistaPieza {
  recuadro: ItemRecuadro[];
  figuras: HallazgoDef[];
  /** Texto accesible con todos los hallazgos de la pieza */
  titulo: string;
}

const ANCHO_UTIL = 40;

/** Marcas de una pieza -> lo que se dibuja: items del recuadro (x/tamaño escalan al ancho) y figuras. */
export function vistaDePieza(marcas: MarcaDiente[]): VistaPieza {
  const activos = CATALOGO_HALLAZGOS.filter((h) => h.marcaEnum && marcas.includes(h.marcaEnum));
  const enRecuadro = activos.filter((h) => h.rep !== 'figura');
  const n = enRecuadro.length;
  const paso = ANCHO_UTIL / Math.max(n, 1);
  const fontSize = n <= 3 ? 10 : n <= 5 ? 8 : 6;
  return {
    recuadro: enRecuadro.map((h, i) => ({
      id: h.id,
      simbolo: h.simbolo,
      forma: h.forma,
      token: h.token,
      label: h.label,
      x: (i - (n - 1) / 2) * paso,
      fontSize,
      half: Math.min(paso, 14) / 2 - 0.5,
    })),
    figuras: activos.filter((h) => h.rep === 'figura'),
    titulo: activos.map((h) => h.label).join(', '),
  };
}
