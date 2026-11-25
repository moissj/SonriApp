import { cabecerasSemana, celdasMes, desplazar, rangoConsulta, rangoSemana, textoRango } from './calendario.funcion';

describe('calendario.funcion', () => {
  it('rangoSemana: domingo pertenece a la semana que empezó el lunes previo', () => {
    const { monday, sunday } = rangoSemana('2026-11-29'); // domingo
    expect(monday.getDate()).toBe(23);
    expect(sunday.getDate()).toBe(29);
  });

  it('cabecerasSemana devuelve 7 días', () => {
    expect(cabecerasSemana('2026-11-25').length).toBe(7);
  });

  it('celdasMes: 42 celdas y marca hoy', () => {
    const c = celdasMes('2026-11-25', '2026-11-25');
    expect(c.length).toBe(42);
    expect(c.filter((x) => x.isToday).length).toBe(1);
  });

  it('rangoConsulta: día y lista (semana)', () => {
    expect(rangoConsulta('dia', '2026-11-25').start).toBe('2026-11-25T00:00:00.000Z');
    expect(rangoConsulta('lista', '2026-11-25').start).toBe('2026-11-23T00:00:00.000Z');
  });

  it('desplazar por vista', () => {
    expect(desplazar('dia', '2026-11-25', 1)).toBe('2026-11-26');
    expect(desplazar('semana', '2026-11-25', -1)).toBe('2026-11-18');
    expect(desplazar('mes', '2026-11-15', 1)).toBe('2026-12-15');
  });

  it('textoRango mes capitaliza', () => {
    expect(textoRango('mes', '2026-11-25')).toBe('Noviembre de 2026');
  });
});
