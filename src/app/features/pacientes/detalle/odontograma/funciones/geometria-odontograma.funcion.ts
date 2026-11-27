import type { SuperficieDiente } from '../../../../../core/services/odontograma.service';

// GEOMETRIA PROTEGIDA (clinica/odontograma.md): movida verbatim desde odontograma.ts, sin cambios.
export interface DienteSVG {
  fdi: string;
  cx: number;
  cy: number;
}

export interface Segmento {
  superficie: SuperficieDiente;
  d: string;
}

type Paths = { top: string; right: string; bottom: string; left: string };

// --- Geometría de la "diana" (tres niveles concéntricos) ---
export const R_OUTER = 26; // borde exterior del anillo cervical
const R_MID = 19; // frontera cervical/intermedio
const R_CENTER = 10; // radio del centro (oclusal/incisal) = interior del intermedio
const DO = +(R_MID * Math.SQRT1_2).toFixed(2); // proyección diagonal exterior del intermedio
const DI = +(R_CENTER * Math.SQRT1_2).toFixed(2); // proyección diagonal interior
const DOC = +(R_OUTER * Math.SQRT1_2).toFixed(2); // proyección diagonal exterior del cervical
const DIC = +(R_MID * Math.SQRT1_2).toFixed(2); // proyección diagonal interior del cervical

// --- Distribución (4 cuadrantes) ---
const LEFT_START = 40;
const COL_STEP = 62;
const RIGHT_START = 566;
const ROW = { supPerm: 72, supTemp: 200, infTemp: 340, infPerm: 468 };
export const NUM_DY = -40;

// Bloques FDI que quedan a la izquierda del gráfico (línea media a su derecha)
const BLOQUE_IZQ = ['1', '4', '5', '8'];

// Anillo intermedio (caras): entre el centro (R_CENTER) y R_MID
const PATHS_MEDIO: Paths = {
  top: `M ${-DI} ${-DI} L ${-DO} ${-DO} A ${R_MID} ${R_MID} 0 0 1 ${DO} ${-DO} L ${DI} ${-DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${-DI} ${-DI} Z`,
  right: `M ${DI} ${-DI} L ${DO} ${-DO} A ${R_MID} ${R_MID} 0 0 1 ${DO} ${DO} L ${DI} ${DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${DI} ${-DI} Z`,
  bottom: `M ${DI} ${DI} L ${DO} ${DO} A ${R_MID} ${R_MID} 0 0 1 ${-DO} ${DO} L ${-DI} ${DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${DI} ${DI} Z`,
  left: `M ${-DI} ${DI} L ${-DO} ${DO} A ${R_MID} ${R_MID} 0 0 1 ${-DO} ${-DO} L ${-DI} ${-DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${-DI} ${DI} Z`,
};

// Anillo cervical (tercio exterior): entre R_MID y R_OUTER, mismos 4 sectores
const PATHS_CERVICAL: Paths = {
  top: `M ${-DIC} ${-DIC} L ${-DOC} ${-DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${DOC} ${-DOC} L ${DIC} ${-DIC} A ${R_MID} ${R_MID} 0 0 0 ${-DIC} ${-DIC} Z`,
  right: `M ${DIC} ${-DIC} L ${DOC} ${-DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${DOC} ${DOC} L ${DIC} ${DIC} A ${R_MID} ${R_MID} 0 0 0 ${DIC} ${-DIC} Z`,
  bottom: `M ${DIC} ${DIC} L ${DOC} ${DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${-DOC} ${DOC} L ${-DIC} ${DIC} A ${R_MID} ${R_MID} 0 0 0 ${DIC} ${DIC} Z`,
  left: `M ${-DIC} ${DIC} L ${-DOC} ${DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${-DOC} ${-DOC} L ${-DIC} ${-DIC} A ${R_MID} ${R_MID} 0 0 0 ${-DIC} ${DIC} Z`,
};

/** Centro: oclusal (posteriores) / incisal (anteriores) */
export const PATH_CENTRO = `M ${-R_CENTER} 0 A ${R_CENTER} ${R_CENTER} 0 1 1 ${R_CENTER} 0 A ${R_CENTER} ${R_CENTER} 0 1 1 ${-R_CENTER} 0 Z`;

function fila(teeth: string[], side: 'left' | 'right', startCol: number, cy: number): DienteSVG[] {
  return teeth.map((fdi, i) => ({
    fdi,
    cx: (side === 'left' ? LEFT_START : RIGHT_START) + (startCol + i) * COL_STEP,
    cy,
  }));
}

export const DIENTES: DienteSVG[] = [
  ...fila(['18', '17', '16', '15', '14', '13', '12', '11'], 'left', 0, ROW.supPerm),
  ...fila(['21', '22', '23', '24', '25', '26', '27', '28'], 'right', 0, ROW.supPerm),
  ...fila(['55', '54', '53', '52', '51'], 'left', 3, ROW.supTemp),
  ...fila(['61', '62', '63', '64', '65'], 'right', 0, ROW.supTemp),
  ...fila(['85', '84', '83', '82', '81'], 'left', 3, ROW.infTemp),
  ...fila(['71', '72', '73', '74', '75'], 'right', 0, ROW.infTemp),
  ...fila(['48', '47', '46', '45', '44', '43', '42', '41'], 'left', 0, ROW.infPerm),
  ...fila(['31', '32', '33', '34', '35', '36', '37', '38'], 'right', 0, ROW.infPerm),
];

export const VIEW_WIDTH = RIGHT_START + 7 * COL_STEP + R_OUTER + 20;
export const VIEW_HEIGHT = ROW.infPerm + 72; // incluye la cajita de marcas de la fila inferior
export const DIVIDER_X = (LEFT_START + 7 * COL_STEP + RIGHT_START) / 2;
export const DIVIDER_Y = (ROW.supTemp + ROW.infTemp) / 2;

/** ¿Es pieza anterior (incisivo/canino)? Determina oclusal vs incisal */
export function esAnterior(fdi: string): boolean {
  return ['1', '2', '3'].includes(fdi[1]);
}

/** Segmentos de un anillo (intermedio o cervical) con mesial/distal por cuadrante */
export function segmentosAnillo(fdi: string, cervical: boolean): Segmento[] {
  const paths = cervical ? PATHS_CERVICAL : PATHS_MEDIO;
  const izq = BLOQUE_IZQ.includes(fdi[0]); // línea media a la derecha del diente
  const s = (base: string): SuperficieDiente => (cervical ? `cervical_${base}` : base) as SuperficieDiente;
  return [
    { superficie: s('vestibular'), d: paths.top },
    { superficie: s('lingual_palatina'), d: paths.bottom },
    { superficie: izq ? s('mesial') : s('distal'), d: paths.right },
    { superficie: izq ? s('distal') : s('mesial'), d: paths.left },
  ];
}
