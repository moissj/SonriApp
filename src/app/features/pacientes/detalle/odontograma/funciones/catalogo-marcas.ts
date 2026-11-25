import type { MarcaDiente } from '../../../../../core/services/odontograma.service';

export interface MarcaCatalogo {
  marca: MarcaDiente;
  letra: string;
  color: string;
  label: string;
}

export const CATALOGO_MARCAS: MarcaCatalogo[] = [
  { marca: 'obt_temporal', letra: 'OT', color: '#ef4444', label: 'Obturacion temporal' },
  { marca: 'incluido_semi', letra: 'X', color: '#16a34a', label: 'Incluido / Semiincluido' },
  { marca: 'superficie_sellada', letra: 'S', color: '#14b8a6', label: 'Superficie sellada' },
  { marca: 'corona_acero', letra: 'C', color: '#f59e0b', label: 'Corona adaptada / Acero' },
  { marca: 'nucleo', letra: 'N', color: '#2563eb', label: 'Nucleo' },
];

/** Letras a pintar en la cajita, en orden del catalogo; ignora marcas desconocidas. */
export function letrasDeMarcas(marcas: MarcaDiente[]): { letra: string; color: string }[] {
  return CATALOGO_MARCAS.filter((c) => marcas.includes(c.marca)).map(({ letra, color }) => ({ letra, color }));
}
