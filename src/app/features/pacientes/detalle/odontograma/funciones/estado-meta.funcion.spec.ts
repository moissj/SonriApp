import { OdontogramaMeta, OdontogramaTipo } from '../../../../../core/services/odontograma.service';
import { editorBloqueado, metaDe } from './estado-meta.funcion';

const meta = (tipo: OdontogramaTipo, estado: 'borrador' | 'cerrado'): OdontogramaMeta => ({
  id: 'm', odontologo_id: 'o', paciente_id: 'p', tipo, estado, fecha: '2026-01-01', creado_por: null, cerrado_en: null, notas: null,
});

describe('estado-meta', () => {
  it('metaDe encuentra por tipo', () => {
    expect(metaDe([meta('final', 'borrador')], 'inicial')).toBeNull();
    expect(metaDe([meta('final', 'borrador')], 'final')?.tipo).toBe('final');
  });

  it('bloquea si meta no cargada', () => {
    expect(editorBloqueado(null, 'inicial')).toBe(true);
  });

  it('inicial sin meta es editable; final sin meta no', () => {
    expect(editorBloqueado([], 'inicial')).toBe(false);
    expect(editorBloqueado([], 'final')).toBe(true);
  });

  it('cerrado bloquea y borrador no', () => {
    expect(editorBloqueado([meta('inicial', 'cerrado')], 'inicial')).toBe(true);
    expect(editorBloqueado([meta('inicial', 'borrador')], 'inicial')).toBe(false);
  });
});
