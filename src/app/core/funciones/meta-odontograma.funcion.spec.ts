import { filaAMeta } from './meta-odontograma.funcion';

describe('filaAMeta', () => {
  it('normaliza nulos ausentes', () => {
    const m = filaAMeta({ id: 'a', odontologo_id: 'o', paciente_id: 'p', tipo: 'inicial', estado: 'borrador', fecha: '2026-01-02' });
    expect(m.creado_por).toBeNull();
    expect(m.cerrado_en).toBeNull();
    expect(m.notas).toBeNull();
    expect(m.estado).toBe('borrador');
  });

  it('conserva valores presentes', () => {
    const m = filaAMeta({
      id: 'a', odontologo_id: 'o', paciente_id: 'p', tipo: 'final', estado: 'cerrado',
      fecha: '2026-01-02', creado_por: 'u', cerrado_en: '2026-01-02T10:00:00Z', notas: 'x',
    });
    expect(m.tipo).toBe('final');
    expect(m.creado_por).toBe('u');
    expect(m.cerrado_en).toBe('2026-01-02T10:00:00Z');
    expect(m.notas).toBe('x');
  });
});
