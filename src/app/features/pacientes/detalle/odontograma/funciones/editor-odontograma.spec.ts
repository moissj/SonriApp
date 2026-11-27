import { PilaEdicion, OpEdicion, invertir, auditoriaDeOp, conMarca, conEstado } from './editor-odontograma';
import type { MarcaDiente } from '../../../../../core/services/odontograma.service';

const op = (n: number, extra: Partial<OpEdicion> = {}): OpEdicion =>
  ({ clase: 'marca', pieza: '11', hallazgoId: 'corona', antes: false, despues: true, ...extra, superficie: `s${n}` });

describe('PilaEdicion', () => {
  it('push/undo/redo', () => {
    const p = new PilaEdicion();
    expect(p.puedeUndo).toBe(false);
    p.push(op(1));
    p.push(op(2));
    expect(p.undo()?.superficie).toBe('s2');
    expect(p.puedeRedo).toBe(true);
    expect(p.redo()?.superficie).toBe('s2');
    expect(p.redo()).toBeNull();
  });

  it('respeta el limite descartando las mas viejas', () => {
    const p = new PilaEdicion(50);
    for (let i = 0; i < 60; i++) p.push(op(i));
    let n = 0;
    let ultima: OpEdicion | null = null;
    for (let o = p.undo(); o; o = p.undo()) {
      n++;
      ultima = o;
    }
    expect(n).toBe(50);
    expect(ultima?.superficie).toBe('s10');
  });

  it('push invalida el redo', () => {
    const p = new PilaEdicion();
    p.push(op(1));
    p.undo();
    p.push(op(2));
    expect(p.puedeRedo).toBe(false);
  });

  it('deshace y rehace por grupo', () => {
    const p = new PilaEdicion();
    p.push(op(1));
    p.push(op(2, { grupo: 7 }));
    p.push(op(3, { grupo: 7 }));
    expect(p.undoGrupo().length).toBe(2);
    expect(p.redoGrupo().length).toBe(2);
  });
});

describe('inversion y auditoria', () => {
  it('invierte marca y fill', () => {
    expect(invertir(op(1))).toEqual(expect.objectContaining({ antes: true, despues: false }));
    const f = invertir({ clase: 'fill', pieza: '11', hallazgoId: 'caries', superficie: 'mesial', antes: 'sano', despues: 'caries' });
    expect(f.antes).toBe('caries');
    expect(f.despues).toBe('sano');
  });

  it('audita agrega/quita de marca y reemplazo de fill', () => {
    expect(auditoriaDeOp(op(1))[0].accion).toBe('agrega');
    expect(auditoriaDeOp(invertir(op(1)))[0].accion).toBe('quita');
    const r = auditoriaDeOp({ clase: 'fill', pieza: '11', hallazgoId: 'resina', superficie: 'mesial', antes: 'caries', despues: 'resina' });
    expect(r.map((a) => a.hallazgoId + ':' + a.accion)).toEqual(['caries:quita', 'resina:agrega']);
  });

  it('actualiza mapas sin mutar', () => {
    const m = new Map<string, MarcaDiente[]>();
    const n = conMarca(m, '11', 'corona_acero', true);
    expect(m.size).toBe(0);
    expect(conMarca(n, '11', 'corona_acero', false).get('11')).toEqual([]);
    expect(conEstado({}, 'p', '11', 'mesial', 'caries')['11:mesial'].estado).toBe('caries');
  });
});
