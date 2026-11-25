import { FormControl } from '@angular/forms';
import { nitValido, repsValido, opcionalValido, prestadorAUpdate } from './perfil-prestador.funcion';

describe('perfil-prestador', () => {
  it('nitValido', () => {
    for (const v of ['900123456', '900123456-7', '9001234567', '123456'])
      expect(nitValido(v)).toBe(true);
    for (const v of ['', '12345', 'abc123456', '900.123.456', '900123456-77'])
      expect(nitValido(v)).toBe(false);
  });

  it('repsValido', () => {
    for (const v of ['12345678', '123456789012']) expect(repsValido(v)).toBe(true);
    for (const v of ['', '1234567', '1234567890123', '1234abcd5'])
      expect(repsValido(v)).toBe(false);
  });

  it('opcionalValido acepta vacío y rechaza formato inválido', () => {
    const val = opcionalValido(nitValido);
    expect(val(new FormControl(''))).toBeNull();
    expect(val(new FormControl('900123456'))).toBeNull();
    expect(val(new FormControl('xx'))).toEqual({ formato: true });
  });

  it('prestadorAUpdate recorta y convierte vacío a null', () => {
    expect(
      prestadorAUpdate({ nit: ' 900123456-7 ', razon_social: '  ', codigo_habilitacion_reps: '' }),
    ).toEqual({ nit: '900123456-7', razon_social: null, codigo_habilitacion_reps: null });
  });
});
