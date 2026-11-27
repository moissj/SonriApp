import { etiquetaZona, tituloSuperficie } from './etiquetas-odontograma.funcion';

describe('etiquetas-odontograma', () => {
  it('titulo: incisal en anteriores, oclusal en posteriores', () => {
    expect(tituloSuperficie('11', 'oclusal_incisal')).toBe('Pieza 11 · Incisal');
    expect(tituloSuperficie('16', 'oclusal_incisal')).toBe('Pieza 16 · Oclusal');
    expect(tituloSuperficie('16', 'mesial')).toBe('Pieza 16 · Mesial');
  });

  it('etiquetaZona: hallazgo del catalogo y legado', () => {
    expect(etiquetaZona('11', 'distal', 'resina')).toBe('Pieza 11, Distal: Obturado en resina/ionomero');
    expect(etiquetaZona('11', 'distal', 'sano')).toBe('Pieza 11, Distal: Sin hallazgo');
  });
});
