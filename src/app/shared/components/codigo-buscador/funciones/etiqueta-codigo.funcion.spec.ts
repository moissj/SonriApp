import { etiquetaCodigo } from './etiqueta-codigo.funcion';

describe('etiquetaCodigo', () => {
  it('une código y descripción', () => {
    expect(etiquetaCodigo({ codigo: 'K021', descripcion: 'Caries de la dentina' })).toBe('K021 — Caries de la dentina');
  });
  it('solo código si la descripción está vacía', () => {
    expect(etiquetaCodigo({ codigo: 'Z012', descripcion: '' })).toBe('Z012');
  });
  it('solo código si la descripción son espacios', () => {
    expect(etiquetaCodigo({ codigo: 'Z012', descripcion: '   ' })).toBe('Z012');
  });
});
