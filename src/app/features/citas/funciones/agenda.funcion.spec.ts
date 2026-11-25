import { agruparPorDia, clasesCita, posicionAhora, posicionBloque, PX_POR_HORA } from './agenda.funcion';

describe('agenda.funcion', () => {
  it('posicionBloque: 09:30 Bogota (14:30Z), 60 min', () => {
    const p = posicionBloque('2026-11-25T14:30:00Z', 60);
    expect(p).toEqual({ top: PX_POR_HORA * 1.5, height: PX_POR_HORA });
  });

  it('posicionBloque: fuera de rango -> null; alto mínimo', () => {
    expect(posicionBloque('2026-11-25T11:00:00Z', 30)).toBeNull(); // 06:00 Bogota
    expect(posicionBloque('2026-11-25T13:00:00Z', 5)!.height).toBeGreaterThanOrEqual(28);
  });

  it('posicionAhora: rango horario', () => {
    expect(posicionAhora(new Date('2026-11-25T13:00:00Z'))).toBe(0); // 08:00
    expect(posicionAhora(new Date('2026-11-26T03:00:00Z'))).toBeNull(); // 22:00
  });

  it('agruparPorDia ordena y agrupa por día Bogota', () => {
    const g = agruparPorDia([
      { fecha_hora: '2026-11-26T14:00:00Z' },
      { fecha_hora: '2026-11-26T03:00:00Z' }, // 25 22:00 Bogota
      { fecha_hora: '2026-11-25T15:00:00Z' },
    ]);
    expect(g.map((x) => x.dia)).toEqual(['2026-11-25', '2026-11-26']);
    expect(g[0].citas.length).toBe(2);
  });

  it('clasesCita usa tono; desconocido -> neutral', () => {
    expect(clasesCita('en_atencion').punto).toBe('bg-violet-500');
    expect(clasesCita('x').punto).toBe('bg-slate-400');
  });
});
