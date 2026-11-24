import { construirRutaStorage } from './ruta-storage.funcion';

describe('construirRutaStorage', () => {
  it('arma odon/pac/uuid-nombre', () => {
    expect(construirRutaStorage('o1', 'p1', 'firma.pdf', 'u1')).toBe('o1/p1/u1-firma.pdf');
  });

  it('sanitiza espacios, mayusculas y caracteres especiales', () => {
    expect(construirRutaStorage('o1', 'p1', 'Mi Firma (1).PDF', 'u1')).toBe('o1/p1/u1-mi-firma-1.pdf');
  });

  it('genera uuid por defecto', () => {
    expect(construirRutaStorage('o', 'p', 'a.png')).toMatch(/^o\/p\/[0-9a-f-]{36}-a\.png$/);
  });
});
