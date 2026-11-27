import type { EstadoDiente, MarcaDiente, SuperficieDiente } from '../../../../../core/services/odontograma.service';

export interface EstadoOdontograma {
  superficies: { pieza: string; superficie: SuperficieDiente; estado: EstadoDiente }[];
  marcas: Map<string, MarcaDiente[]>;
}

function firmas(e: EstadoOdontograma): Map<string, string> {
  const partes = new Map<string, string[]>();
  const add = (p: string, t: string) => partes.set(p, [...(partes.get(p) ?? []), t]);
  for (const s of e.superficies) if (s.estado !== 'sano') add(s.pieza, `s:${s.superficie}=${s.estado}`);
  for (const [p, ms] of e.marcas) for (const m of ms) add(p, `m:${m}`);
  return new Map([...partes].map(([p, t]) => [p, [...t].sort().join('|')]));
}

/** FDI (orden numérico) de las piezas cuyas superficies no sanas o marcas difieren entre ambos estados. */
export function dientesConCambios(a: EstadoOdontograma, b: EstadoOdontograma): string[] {
  const fa = firmas(a);
  const fb = firmas(b);
  const piezas = new Set([...fa.keys(), ...fb.keys()]);
  return [...piezas].filter((p) => fa.get(p) !== fb.get(p)).sort((x, y) => Number(x) - Number(y));
}
