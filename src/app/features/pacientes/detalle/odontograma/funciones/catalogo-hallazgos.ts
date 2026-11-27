import type { EstadoDiente, MarcaDiente } from '../../../../../core/services/odontograma.service';

export type RepHallazgo = 'fill' | 'figura' | 'recuadro' | 'fill+recuadro';

export interface HallazgoDef {
  id: string;
  rep: RepHallazgo;
  simbolo?: string;
  forma?: 'ovalito' | 'linea-horizontal' | 'barra-gruesa' | 'asterisco';
  /** Token de color `odo-*` (tailwind.config.js + variables CSS de odontograma.css) */
  token: string;
  label: string;
  estadoEnum?: EstadoDiente;
  marcaEnum?: MarcaDiente;
  excluyente?: boolean;
}

/** Fuente única de hallazgos (contrato plan 26). El orden define render y leyenda. */
export const CATALOGO_HALLAZGOS: HallazgoDef[] = [
  { id: 'caries', rep: 'fill', token: 'odo-caries', label: 'Caries / Obt. temporal', estadoEnum: 'caries' },
  { id: 'obt_desadaptada', rep: 'fill', token: 'odo-desadaptada', label: 'Obturacion desadaptada', estadoEnum: 'obt_desadaptada' },
  { id: 'resina', rep: 'fill', token: 'odo-resina', label: 'Obturado en resina/ionomero', estadoEnum: 'resina' },
  { id: 'amalgama', rep: 'fill', token: 'odo-amalgama', label: 'Obturado en amalgama', estadoEnum: 'amalgama' },
  { id: 'ausente', rep: 'fill+recuadro', token: 'odo-negro', simbolo: 'A', label: 'Ausente', estadoEnum: 'ausente', marcaEnum: 'ausente' },
  { id: 'implante', rep: 'fill', token: 'odo-implante', label: 'Implante', estadoEnum: 'implante' },
  { id: 'endo_realizada', rep: 'figura', forma: 'ovalito', token: 'odo-endo-realizada', label: 'Endodoncia realizada', marcaEnum: 'endo_realizada' },
  { id: 'endo_indicada', rep: 'figura', forma: 'ovalito', token: 'odo-endo-indicada', label: 'Endodoncia a realizar', marcaEnum: 'endo_indicada' },
  { id: 'sano', rep: 'recuadro', simbolo: 'S', token: 'odo-sano', label: 'Diente sano', marcaEnum: 'sano', excluyente: true },
  { id: 'corona', rep: 'recuadro', simbolo: 'C', token: 'odo-corona', label: 'Corona', marcaEnum: 'corona_acero' },
  { id: 'sin_erupcionar', rep: 'recuadro', forma: 'linea-horizontal', token: 'odo-negro', label: 'Sin erupcionar', marcaEnum: 'sin_erupcionar' },
  { id: 'resto_radicular', rep: 'recuadro', simbolo: 'R', token: 'odo-rojo', label: 'Resto radicular', marcaEnum: 'resto_radicular' },
  { id: 'exodoncia_indicada', rep: 'recuadro', simbolo: 'X', token: 'odo-rojo', label: 'Exodoncia simple indicada', marcaEnum: 'exodoncia_indicada' },
  { id: 'sellante_indicado', rep: 'recuadro', simbolo: 'S', token: 'odo-rojo', label: 'Sellante indicado', marcaEnum: 'sellante_indicado' },
  { id: 'nucleo', rep: 'recuadro', simbolo: 'N', token: 'odo-azul', label: 'Nucleo', marcaEnum: 'nucleo' },
  { id: 'pontico', rep: 'recuadro', simbolo: 'O', token: 'odo-rojo', label: 'Pontico', marcaEnum: 'pontico' },
  { id: 'protesis_removible', rep: 'recuadro', forma: 'barra-gruesa', token: 'odo-azul', label: 'Protesis removible', marcaEnum: 'protesis_removible' },
  { id: 'erosion', rep: 'recuadro', simbolo: 'E', token: 'odo-rojo', label: 'Erosion', marcaEnum: 'erosion' },
  // PENDIENTE confirmar asterisco rojo: se mantiene la 'X' verde del plan 25.
  { id: 'incluido_semi', rep: 'recuadro', simbolo: 'X', token: 'odo-sano', label: 'Incluido / Semiincluido', marcaEnum: 'incluido_semi' },
  { id: 'obt_temporal', rep: 'recuadro', simbolo: 'OT', token: 'odo-rojo', label: 'Obturacion temporal', marcaEnum: 'obt_temporal' },
  { id: 'superficie_sellada', rep: 'recuadro', simbolo: 'S', token: 'odo-teal', label: 'Superficie sellada', marcaEnum: 'superficie_sellada' },
];

export const hallazgosRecuadro = (): HallazgoDef[] =>
  CATALOGO_HALLAZGOS.filter((h) => h.rep === 'recuadro' || h.rep === 'fill+recuadro');

export const hallazgosFill = (): HallazgoDef[] =>
  CATALOGO_HALLAZGOS.filter((h) => h.rep === 'fill' || h.rep === 'fill+recuadro');

/** Hallazgos activables como marca (recuadro + figuras), para el modal de marcas. */
export const hallazgosMarca = (): HallazgoDef[] => CATALOGO_HALLAZGOS.filter((h) => h.marcaEnum);

export const hallazgoPorMarca = (marca: MarcaDiente): HallazgoDef | undefined =>
  CATALOGO_HALLAZGOS.find((h) => h.marcaEnum === marca);

export const hallazgoPorEstado = (estado: EstadoDiente): HallazgoDef | undefined =>
  CATALOGO_HALLAZGOS.find((h) => h.estadoEnum === estado);

/** Letras del recuadro (orden del catalogo); ignora marcas sin simbolo o desconocidas. */
export function letrasDeMarcas(marcas: MarcaDiente[]): { letra: string; token: string }[] {
  return hallazgosRecuadro()
    .filter((h) => h.simbolo && h.marcaEnum && marcas.includes(h.marcaEnum))
    .map((h) => ({ letra: h.simbolo as string, token: h.token }));
}

/** Glifo textual para leyenda/modal: letra, o forma sin letra (el color nunca es la unica señal). */
export function glifoDe(h: HallazgoDef): string {
  if (h.simbolo) return h.simbolo;
  if (h.forma === 'ovalito') return '○';
  if (h.forma === 'linea-horizontal') return '—';
  if (h.forma === 'barra-gruesa') return '▬';
  return '';
}

export interface GrupoLeyenda {
  titulo: string;
  items: { h: HallazgoDef; glifo: string }[];
}

/** Leyenda agrupada por tipo, generada del catalogo. */
export function leyendaHallazgos(): GrupoLeyenda[] {
  const g = (titulo: string, lista: HallazgoDef[]): GrupoLeyenda => ({
    titulo,
    items: lista.map((h) => ({ h, glifo: glifoDe(h) })),
  });
  return [
    g('Superficies', hallazgosFill()),
    g('Figura en el diente', CATALOGO_HALLAZGOS.filter((h) => h.rep === 'figura')),
    g('Recuadro', CATALOGO_HALLAZGOS.filter((h) => h.rep === 'recuadro')),
  ];
}
