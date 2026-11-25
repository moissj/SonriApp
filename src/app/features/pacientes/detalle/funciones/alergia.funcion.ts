const SIN_ALERGIA = new Set([
  'n/a', 'na', 'n.a.', 'ninguna', 'ninguno', 'no', 'no aplica',
  'no refiere', 'sin alergias', 'sin', '-', 'ninguna conocida',
]);

/** True solo si el texto describe una alergia real (no vacío ni placeholder). */
export function tieneAlergiaReal(alergias: string | null | undefined): boolean {
  if (!alergias) return false;
  const v = alergias.trim().toLowerCase();
  return v !== '' && !SIN_ALERGIA.has(v);
}
