import { Cita } from '../../../core/services/cita.service';
import { agruparPorDia } from './agrupar-por-dia.funcion';

const cita = (id: string, fecha_hora: string): Cita => ({
  id, fecha_hora, estado: 'pendiente', paciente_id: 'p', duracion_minutos: 30,
  tipo_tratamiento: 'x', canal_origen: 'manual',
});

describe('agruparPorDia', () => {
  const citas = [
    cita('c', '2026-07-09T09:00:00-05:00'),
    cita('b', '2026-07-08T15:00:00-05:00'),
    cita('a', '2026-07-08T09:00:00-05:00'),
  ];

  it('agrupa por día ascendente y ordena por hora', () => {
    const r = agruparPorDia(citas, new Map());
    expect(r.map((d) => d.fecha)).toEqual(['2026-07-08', '2026-07-09']);
    expect(r[0].pendientes.map((x) => x.cita.id)).toEqual(['a', 'b']);
  });

  it('separa enviados y conserva ultimoEnvio', () => {
    const r = agruparPorDia(citas, new Map([['b', '2026-07-07T10:00:00Z']]));
    expect(r[0].pendientes.map((x) => x.cita.id)).toEqual(['a']);
    expect(r[0].enviados[0].ultimoEnvio).toBe('2026-07-07T10:00:00Z');
    expect(r[0].pendientes[0].ultimoEnvio).toBeNull();
  });

  it('usa día Bogota sin desfase UTC', () => {
    // 23:30 Bogota del 8 = 04:30 UTC del 9
    const r = agruparPorDia([cita('x', '2026-07-08T23:30:00-05:00')], new Map());
    expect(r[0].fecha).toBe('2026-07-08');
  });
});
