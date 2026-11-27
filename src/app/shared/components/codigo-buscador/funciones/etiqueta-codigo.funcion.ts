export interface CodigoClinico {
  codigo: string;
  descripcion: string;
}

/** Etiqueta visible de un código clínico: "K021 — Descripción" (solo código si no hay descripción). */
export function etiquetaCodigo(c: CodigoClinico): string {
  const desc = c.descripcion.trim();
  return desc ? `${c.codigo} — ${desc}` : c.codigo;
}
