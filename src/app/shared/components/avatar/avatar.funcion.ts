/** 1-2 iniciales en mayúscula (primeras dos palabras); '' si el nombre está vacío. */
export function iniciales(nombre: string): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}
