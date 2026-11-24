import { validarArchivoConsentimiento, MAX_BYTES_CONSENT } from './validar-archivo.funcion';

describe('validarArchivoConsentimiento', () => {
  for (const type of ['application/pdf', 'image/jpeg', 'image/png']) {
    it(`acepta ${type}`, () => {
      expect(validarArchivoConsentimiento({ type, size: 1000 })).toEqual({ ok: true });
    });
  }

  it('rechaza tipo no permitido', () => {
    expect(validarArchivoConsentimiento({ type: 'text/plain', size: 10 })).toEqual({
      ok: false,
      error: 'Formato no permitido (PDF, JPG o PNG).',
    });
  });

  it('rechaza archivo mayor a 10 MB', () => {
    expect(validarArchivoConsentimiento({ type: 'application/pdf', size: MAX_BYTES_CONSENT + 1 })).toEqual({
      ok: false,
      error: 'Archivo supera 10 MB.',
    });
  });

  it('acepta exactamente 10 MB', () => {
    expect(validarArchivoConsentimiento({ type: 'image/png', size: MAX_BYTES_CONSENT }).ok).toBe(true);
  });
});
