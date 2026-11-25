import { describe, expect, it } from 'vitest';
import { calcularFaltantes, textoFaltan, opcionesDuracion, construirCita } from './cita-modal.funcion';

describe('cita-modal.funcion', () => {
  it('calcularFaltantes: todo vacío lista los cuatro en orden', () => {
    expect(calcularFaltantes({ paciente: false, tratamiento: '', fechaHora: null, duracion: null }))
      .toEqual(['Paciente', 'Tratamiento', 'Fecha y hora', 'Duración']);
  });

  it('calcularFaltantes: completo devuelve vacío; duración <5 falta', () => {
    const ok = { paciente: true, tratamiento: 'x', fechaHora: '2026-01-01T10:00', duracion: 30 };
    expect(calcularFaltantes(ok)).toEqual([]);
    expect(calcularFaltantes({ ...ok, duracion: 3 })).toEqual(['Duración']);
  });

  it('textoFaltan', () => {
    expect(textoFaltan([])).toBe('');
    expect(textoFaltan(['Paciente', 'Tratamiento'])).toBe('Falta: Paciente, Tratamiento');
  });

  it('opcionesDuracion agrega chip extra ordenado y no duplica', () => {
    const base = [15, 30, 45];
    expect(opcionesDuracion(base, 20).map((o) => o.value)).toEqual([15, 20, 30, 45]);
    expect(opcionesDuracion(base, 20)[1].label).toBe('20 min');
    expect(opcionesDuracion(base, 30).map((o) => o.value)).toEqual([15, 30, 45]);
  });

  it('construirCita normaliza notas y canal', () => {
    const c = construirCita(null, 'p1', { fecha_hora: '2026-01-01T10:00', duracion_minutos: 30, tipo_tratamiento: 't', estado: 'pendiente' });
    expect(c.id).toBeUndefined();
    expect(c.notas).toBe('');
    expect(c.canal_origen).toBe('manual');
  });
});
