import { calcularEdad } from './edad.funcion';

describe('calcularEdad', () => {
  it('null/inválido', () => {
    expect(calcularEdad(null, '2026-11-25')).toBeNull();
    expect(calcularEdad('x', '2026-11-25')).toBeNull();
  });
  it('antes y después del cumpleaños', () => {
    expect(calcularEdad('2000-12-01', '2026-11-25')).toBe(25);
    expect(calcularEdad('2000-11-25', '2026-11-25')).toBe(26);
  });
  it('fecha futura -> null', () => expect(calcularEdad('2030-01-01', '2026-11-25')).toBeNull());
  it('recién nacido -> 0', () => expect(calcularEdad('2026-06-01', '2026-11-25')).toBe(0));
});
