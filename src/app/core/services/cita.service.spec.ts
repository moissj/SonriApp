import { TestBed } from '@angular/core/testing';
import { CitaService, Cita } from './cita.service';
import { AuthService } from './auth.service';

/** Cita base: 8 jul 2026, 10:00–10:30 (30 min), confirmada */
function citaBase(overrides: Partial<Cita> = {}): Cita {
  return {
    id: 'c1',
    odontologo_id: 'o1',
    paciente_id: 'p1',
    fecha_hora: '2026-07-08T10:00:00.000Z',
    duracion_minutos: 30,
    tipo_tratamiento: 'Limpieza',
    estado: 'confirmada',
    canal_origen: 'manual',
    ...overrides,
  };
}

describe('CitaService.checkOverlap', () => {
  let service: CitaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CitaService, { provide: AuthService, useValue: { user: () => ({ id: 'o1' }) } }],
    });
    service = TestBed.inject(CitaService);
  });

  it('detecta solapamiento cuando los rangos se cruzan', async () => {
    vi.spyOn(service, 'getCitas').mockResolvedValue([citaBase()]);
    const res = await service.checkOverlap('2026-07-08T10:15:00.000Z', 30);
    expect(res.length).toBe(1);
  });

  it('no reporta solapamiento cuando no hay cruce', async () => {
    vi.spyOn(service, 'getCitas').mockResolvedValue([citaBase()]);
    const res = await service.checkOverlap('2026-07-08T11:00:00.000Z', 30);
    expect(res.length).toBe(0);
  });

  it('ignora citas canceladas', async () => {
    vi.spyOn(service, 'getCitas').mockResolvedValue([citaBase({ estado: 'cancelada' })]);
    const res = await service.checkOverlap('2026-07-08T10:15:00.000Z', 30);
    expect(res.length).toBe(0);
  });

  it('excluye la propia cita al editar (excluyendoCitaId)', async () => {
    vi.spyOn(service, 'getCitas').mockResolvedValue([citaBase()]);
    const res = await service.checkOverlap('2026-07-08T10:15:00.000Z', 30, 'c1');
    expect(res.length).toBe(0);
  });

  it('citas contiguas no se consideran solapadas', async () => {
    vi.spyOn(service, 'getCitas').mockResolvedValue([citaBase()]);
    const res = await service.checkOverlap('2026-07-08T10:30:00.000Z', 30);
    expect(res.length).toBe(0);
  });
});
