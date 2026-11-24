export const TIPOS_CONSENT = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const MAX_BYTES_CONSENT = 10 * 1024 * 1024;

export function validarArchivoConsentimiento(f: { type: string; size: number }): { ok: boolean; error?: string } {
  if (!(TIPOS_CONSENT as readonly string[]).includes(f.type)) {
    return { ok: false, error: 'Formato no permitido (PDF, JPG o PNG).' };
  }
  if (f.size > MAX_BYTES_CONSENT) return { ok: false, error: 'Archivo supera 10 MB.' };
  return { ok: true };
}
