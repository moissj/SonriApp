import { iniciales } from './avatar.funcion';

describe('iniciales', () => {
  it('toma dos iniciales en mayúscula', () => expect(iniciales('ana maria perez')).toBe('AM'));
  it('una sola palabra', () => expect(iniciales('Luis')).toBe('L'));
  it('espacios múltiples y bordes', () => expect(iniciales('  juan    gomez ')).toBe('JG'));
  it('vacío', () => expect(iniciales('   ')).toBe(''));
});
