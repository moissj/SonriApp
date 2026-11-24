import { Cita } from '../../../core/services/cita.service';
import { filtrarPendientes } from './pendientes.funcion';

const cita = (id: string, estado: Cita['estado'], fecha_hora: string): Cita => ({
  id, estado, fecha_hora, paciente_id: 'p', duracion_minutos: 30,
  tipo_tratamiento: 'x', canal_origen: 'manual',
});

describe('filtrarPendientes', () => {
  it('excluye por estado y por id enviado, y ordena por hora', () => {
    const citas = [
      cita('a', 'pendiente', '2026-07-08T15:00:00-05:00'),
      cita('b', 'cancelada', '2026-07-08T09:00:00-05:00'),
      cita('c', 'no_asistio', '2026-07-08T09:30:00-05:00'),
      cita('d', 'atendida', '2026-07-08T10:00:00-05:00'),
      cita('e', 'confirmada', '2026-07-08T11:00:00-05:00'),
      cita('f', 'pendiente', '2026-07-08T12:00:00-05:00'),
    ];
    const r = filtrarPendientes(citas, new Set(['f']));
    expect(r.map((c) => c.id)).toEqual(['e', 'a']);
  });
});
