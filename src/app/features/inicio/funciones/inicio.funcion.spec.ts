import { tasaConfirmacion, proximaCita, doughnutCitas } from './inicio.funcion';
import { Cita } from '../../../core/services/cita.service';

const cita = (fecha_hora: string, estado: Cita['estado']): Cita => ({
  paciente_id: 'p', fecha_hora, duracion_minutos: 30, tipo_tratamiento: 't', estado, canal_origen: 'manual',
});

describe('inicio.funcion', () => {
  it('tasaConfirmacion: —, y porcentaje redondeado', () => {
    expect(tasaConfirmacion([{ estado: 'pendiente', count: 0 }])).toBe('—');
    expect(tasaConfirmacion([
      { estado: 'confirmada', count: 1 }, { estado: 'atendida', count: 1 }, { estado: 'pendiente', count: 1 },
    ])).toBe('67%');
  });

  it('proximaCita ignora pasadas y canceladas', () => {
    const ahora = new Date('2026-01-01T15:00:00Z');
    const r = proximaCita([
      cita('2026-01-01T14:00:00Z', 'pendiente'),
      cita('2026-01-01T16:00:00Z', 'cancelada'),
      cita('2026-01-01T17:00:00Z', 'confirmada'),
    ], ahora);
    expect(r?.fecha_hora).toBe('2026-01-01T17:00:00Z');
    expect(proximaCita([], ahora)).toBeNull();
  });

  it('doughnutCitas usa labels de ESTADO_CITA', () => {
    const cfg = doughnutCitas([{ estado: 'no_asistio', count: 2 }]);
    expect(cfg.data.labels).toEqual(['No asistió']);
  });
});
