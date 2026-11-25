import type { Tratamiento } from '../../../core/services/tratamiento.service';
import { contarActivos, duracionPromedio, filtrarTratamientos, precioPromedio } from './tratamientos.funcion';

const t = (o: Partial<Tratamiento>): Tratamiento => ({
  id: 'x', odontologo_id: 'o', nombre: 'N', descripcion: null, precio_base: 0, duracion_minutos: 30, activo: true, ...o,
});

describe('tratamientos.funcion', () => {
  it('promedios de lista vacía son 0', () => {
    expect(precioPromedio([])).toBe(0);
    expect(duracionPromedio([])).toBe(0);
  });
  it('un ítem devuelve su valor', () => {
    expect(precioPromedio([t({ precio_base: 50000 })])).toBe(50000);
    expect(duracionPromedio([t({ duracion_minutos: 45 })])).toBe(45);
  });
  it('redondea el promedio', () => {
    expect(duracionPromedio([t({ duracion_minutos: 30 }), t({ duracion_minutos: 45 })])).toBe(38);
  });
  it('cuenta activos', () => {
    expect(contarActivos([t({}), t({ activo: false })])).toBe(1);
  });
  it('filtra por estado y texto sin tildes', () => {
    const l = [t({ id: '1', nombre: 'Endodoncia' }), t({ id: '2', nombre: 'Limpieza', descripcion: 'Profilaxis', activo: false })];
    expect(filtrarTratamientos(l, 'activos', '').map((x) => x.id)).toEqual(['1']);
    expect(filtrarTratamientos(l, 'inactivos', '').map((x) => x.id)).toEqual(['2']);
    expect(filtrarTratamientos(l, 'todos', 'PROFILAXIS').map((x) => x.id)).toEqual(['2']);
    expect(filtrarTratamientos(l, 'todos', 'éndodoncia').length).toBe(1);
  });
});
