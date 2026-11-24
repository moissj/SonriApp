import { HistoriaDental } from '../examen-ingreso.service';
import { aplicarTodosHd } from './aplicar-todos-hd.funcion';

const base: HistoriaDental = {
  tratamiento_ortopedico: { valor: null, observacion: 'obs' },
  recambio_tardio: { valor: null },
  dolor_atm: { valor: null, lado: 'derecho' },
  ruido_articular: { valor: 'si', lado: null },
  apertura: { valor: null },
  desviacion_apertura: { valor: null, lado: 'izquierdo' },
  ausencias_congenitas: { valor: null },
  succion_digital: { valor: null },
  habito_lengua: { valor: null },
  habito_unas: { valor: null },
  chupete: { valor: null },
  traumas_quistes: { valor: null, observacion: '' },
  sensibilidad: { valor: null },
  cuellos_expuestos: { valor: null, observacion: 'x' },
  habitos_orales: { valor: null },
  supernumerarios: { valor: null, observacion: '' },
  sellantes: { valor: null, observacion: '' },
  frecuencia_cepillado: { valor: '3' },
  uso_seda: { valor: null },
  uso_enjuague: { valor: null, observacion: '' },
};

describe('aplicarTodosHd', () => {
  it("'no' deja apertura normal y el resto 'no'", () => {
    const r = aplicarTodosHd(base, 'no');
    expect(r.apertura.valor).toBe('normal');
    for (const [k, item] of Object.entries(r)) {
      if (k !== 'apertura' && k !== 'frecuencia_cepillado') expect(item.valor).toBe('no');
    }
  });

  it("'si' deja apertura alterada y el resto 'si'", () => {
    const r = aplicarTodosHd(base, 'si');
    expect(r.apertura.valor).toBe('alterada');
    for (const [k, item] of Object.entries(r)) {
      if (k !== 'apertura' && k !== 'frecuencia_cepillado') expect(item.valor).toBe('si');
    }
  });

  it('no toca frecuencia_cepillado (escala 1..6)', () => {
    expect(aplicarTodosHd(base, 'si').frecuencia_cepillado.valor).toBe('3');
  });

  it('conserva lado/observacion y no muta la entrada', () => {
    const r = aplicarTodosHd(base, 'si');
    expect(r.dolor_atm.lado).toBe('derecho');
    expect(r.tratamiento_ortopedico.observacion).toBe('obs');
    expect(base.apertura.valor).toBeNull();
  });
});
