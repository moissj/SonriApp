import {
  CATALOGO_HALLAZGOS,
  hallazgoPorEstado,
  hallazgoPorMarca,
  hallazgosFill,
  hallazgosRecuadro,
  letrasDeMarcas,
} from './catalogo-hallazgos';
import { agruparMarcasPorPieza } from '../../../../../core/funciones/marcas-odontograma.funcion';
import type { EstadoDiente, MarcaDiente, MarcaOdontograma } from '../../../../../core/services/odontograma.service';

// Espejo del union MarcaDiente (si el service agrega una y no esta aqui, el catalogo debe cubrirla igual).
const MARCAS: MarcaDiente[] = [
  'obt_temporal', 'incluido_semi', 'superficie_sellada', 'corona_acero', 'nucleo', 'sano', 'endo_realizada',
  'endo_indicada', 'sin_erupcionar', 'ausente', 'resto_radicular', 'exodoncia_indicada', 'sellante_indicado',
  'pontico', 'protesis_removible', 'erosion',
];
// 'sano','obturado','corona','endodoncia' son legado/migrados: no tienen hallazgo de superficie.
const ESTADOS: EstadoDiente[] = ['caries', 'ausente', 'implante', 'obt_desadaptada', 'resina', 'amalgama'];

const fila = (pieza: string, marca: MarcaDiente): MarcaOdontograma => ({
  id: `${pieza}-${marca}`, odontologo_id: 'o1', paciente_id: 'p1', pieza, marca, notas: null, fecha: '2026-01-01',
});

describe('catalogo-hallazgos', () => {
  it('cada marca del service tiene exactamente un hallazgo', () => {
    for (const m of MARCAS) expect(CATALOGO_HALLAZGOS.filter((h) => h.marcaEnum === m).length).toBe(1);
  });

  it('cada estado de superficie tiene exactamente un hallazgo', () => {
    for (const e of ESTADOS) expect(CATALOGO_HALLAZGOS.filter((h) => h.estadoEnum === e).length).toBe(1);
  });

  it('ids unicos y sin (rep,simbolo,token) duplicados', () => {
    const ids = CATALOGO_HALLAZGOS.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    const claves = CATALOGO_HALLAZGOS.filter((h) => h.simbolo).map((h) => `${h.rep}|${h.simbolo}|${h.token}`);
    expect(new Set(claves).size).toBe(claves.length);
  });

  it('S verde, S roja y S teal son distinguibles por token', () => {
    const s = CATALOGO_HALLAZGOS.filter((h) => h.simbolo === 'S').map((h) => h.token);
    expect(s.sort()).toEqual(['odo-rojo', 'odo-sano', 'odo-teal']);
  });

  it('helpers derivados', () => {
    expect(hallazgosFill().map((h) => h.id)).toEqual(['caries', 'obt_desadaptada', 'resina', 'amalgama', 'ausente', 'implante']);
    expect(hallazgosRecuadro().some((h) => h.rep === 'figura')).toBe(false);
    expect(hallazgoPorMarca('corona_acero')?.simbolo).toBe('C');
    expect(hallazgoPorEstado('resina')?.token).toBe('odo-resina');
    expect(hallazgoPorEstado('obturado')).toBeUndefined();
  });

  it('letrasDeMarcas: vacio, orden de catalogo, ignora figuras y desconocidas', () => {
    expect(letrasDeMarcas([])).toEqual([]);
    expect(letrasDeMarcas(['nucleo', 'obt_temporal', 'endo_realizada']).map((l) => l.letra)).toEqual(['N', 'OT']);
    expect(letrasDeMarcas(['zzz' as MarcaDiente])).toEqual([]);
  });

  it('mapeo marcas -> letras con varias marcas en un diente', () => {
    const porPieza = agruparMarcasPorPieza([fila('11', 'nucleo'), fila('11', 'corona_acero'), fila('21', 'incluido_semi')]);
    expect(letrasDeMarcas(porPieza.get('11') ?? []).map((l) => l.letra)).toEqual(['C', 'N']);
    expect(letrasDeMarcas(porPieza.get('21') ?? []).map((l) => l.letra)).toEqual(['X']);
  });
});
