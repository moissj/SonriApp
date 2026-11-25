import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  computed,
  viewChild,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  OdontogramaService,
  PiezaOdontograma,
  EstadoDiente,
  SuperficieDiente,
  MarcaDiente,
} from '../../../../core/services/odontograma.service';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { agruparMarcasPorPieza } from '../../../../core/funciones/marcas-odontograma.funcion';
import { CATALOGO_MARCAS, letrasDeMarcas } from './funciones/catalogo-marcas';

interface DienteSVG {
  fdi: string;
  cx: number;
  cy: number;
}

interface Segmento {
  superficie: SuperficieDiente;
  d: string;
}

interface EstadoMeta {
  value: EstadoDiente;
  label: string;
}

// --- Geometría de la "diana" (tres niveles concéntricos) ---
const R_OUTER = 26; // borde exterior del anillo cervical
const R_MID = 19; // frontera cervical/intermedio
const R_CENTER = 10; // radio del centro (oclusal/incisal) = interior del intermedio
const DO = +(R_MID * Math.SQRT1_2).toFixed(2); // proyección diagonal exterior del intermedio
const DI = +(R_CENTER * Math.SQRT1_2).toFixed(2); // proyección diagonal interior
const DOC = +(R_OUTER * Math.SQRT1_2).toFixed(2); // proyección diagonal exterior del cervical
const DIC = +(R_MID * Math.SQRT1_2).toFixed(2); // proyección diagonal interior del cervical

// --- Distribución (4 cuadrantes) ---
const LEFT_START = 40;
const COL_STEP = 62;
const RIGHT_START = 566;
const ROW = { supPerm: 72, supTemp: 200, infTemp: 340, infPerm: 468 };
const NUM_DY = -40;

// Bloques FDI que quedan a la izquierda del gráfico (línea media a su derecha)
const BLOQUE_IZQ = ['1', '4', '5', '8'];

@Component({
  selector: 'app-odontograma',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './odontograma.html',
  styleUrl: './odontograma.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontogramaComponent implements OnInit {
  private readonly odontogramaService = inject(OdontogramaService);

  readonly pacienteId = input.required<string>();

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Estado por superficie: clave `${pieza}:${superficie}` -> registro */
  private readonly superficiesMap = signal<Record<string, PiezaOdontograma>>({});

  readonly selPieza = signal<string | null>(null);
  readonly selSuperficie = signal<SuperficieDiente | null>(null);

  readonly formEstado = signal<EstadoDiente>('sano');
  readonly formNotas = signal<string>('');

  /** Zoom: 1 = ajustado al ancho; >1 = ampliado con scroll (mejor toque en móvil) */
  readonly zoom = signal(1);

  private readonly modal = viewChild<ModalComponent>('modalSuperficie');
  private readonly modalMarcas = viewChild<ModalComponent>('modalMarcas');

  /** Marcas nivel-diente: pieza -> marcas activas */
  readonly marcasPorPieza = signal<Map<string, MarcaDiente[]>>(new Map());
  readonly catalogoMarcas = CATALOGO_MARCAS;
  readonly marcaPieza = signal<string | null>(null);
  readonly marcasSel = computed(() => this.marcasPorPieza().get(this.marcaPieza() ?? '') ?? []);
  /** Letras por pieza ya resueltas para el render (evita crear arrays en el template) */
  readonly letrasPorPieza = computed(() => {
    const out = new Map<string, { letra: string; color: string }[]>();
    for (const [p, ms] of this.marcasPorPieza()) out.set(p, letrasDeMarcas(ms));
    return out;
  });

  readonly estados: EstadoMeta[] = [
    { value: 'sano', label: 'Sano' },
    { value: 'caries', label: 'Caries' },
    { value: 'obturado', label: 'Obturado' },
    { value: 'ausente', label: 'Ausente' },
    { value: 'corona', label: 'Corona' },
    { value: 'endodoncia', label: 'Endodoncia' },
    { value: 'implante', label: 'Implante' },
  ];

  private readonly superficieLabels: Record<SuperficieDiente, string> = {
    vestibular: 'Vestibular',
    lingual_palatina: 'Lingual / Palatino',
    mesial: 'Mesial',
    distal: 'Distal',
    oclusal_incisal: 'Oclusal / Incisal',
    cervical_vestibular: 'Cervical vestibular',
    cervical_lingual_palatina: 'Cervical lingual / palatino',
    cervical_mesial: 'Cervical mesial',
    cervical_distal: 'Cervical distal',
  };

  readonly numDy = NUM_DY;
  readonly rOuter = R_OUTER;

  // --- Paths SVG (centrados en 0,0) ---
  // Anillo intermedio (caras): entre el centro (R_CENTER) y R_MID
  private readonly pathTop = `M ${-DI} ${-DI} L ${-DO} ${-DO} A ${R_MID} ${R_MID} 0 0 1 ${DO} ${-DO} L ${DI} ${-DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${-DI} ${-DI} Z`;
  private readonly pathRight = `M ${DI} ${-DI} L ${DO} ${-DO} A ${R_MID} ${R_MID} 0 0 1 ${DO} ${DO} L ${DI} ${DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${DI} ${-DI} Z`;
  private readonly pathBottom = `M ${DI} ${DI} L ${DO} ${DO} A ${R_MID} ${R_MID} 0 0 1 ${-DO} ${DO} L ${-DI} ${DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${DI} ${DI} Z`;
  private readonly pathLeft = `M ${-DI} ${DI} L ${-DO} ${DO} A ${R_MID} ${R_MID} 0 0 1 ${-DO} ${-DO} L ${-DI} ${-DI} A ${R_CENTER} ${R_CENTER} 0 0 0 ${-DI} ${DI} Z`;

  // Anillo cervical (tercio exterior): entre R_MID y R_OUTER, mismos 4 sectores
  private readonly pathCervTop = `M ${-DIC} ${-DIC} L ${-DOC} ${-DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${DOC} ${-DOC} L ${DIC} ${-DIC} A ${R_MID} ${R_MID} 0 0 0 ${-DIC} ${-DIC} Z`;
  private readonly pathCervRight = `M ${DIC} ${-DIC} L ${DOC} ${-DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${DOC} ${DOC} L ${DIC} ${DIC} A ${R_MID} ${R_MID} 0 0 0 ${DIC} ${-DIC} Z`;
  private readonly pathCervBottom = `M ${DIC} ${DIC} L ${DOC} ${DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${-DOC} ${DOC} L ${-DIC} ${DIC} A ${R_MID} ${R_MID} 0 0 0 ${DIC} ${DIC} Z`;
  private readonly pathCervLeft = `M ${-DIC} ${DIC} L ${-DOC} ${DOC} A ${R_OUTER} ${R_OUTER} 0 0 1 ${-DOC} ${-DOC} L ${-DIC} ${-DIC} A ${R_MID} ${R_MID} 0 0 0 ${-DIC} ${DIC} Z`;

  /** Centro: oclusal (posteriores) / incisal (anteriores) */
  readonly pathCentro = `M ${-R_CENTER} 0 A ${R_CENTER} ${R_CENTER} 0 1 1 ${R_CENTER} 0 A ${R_CENTER} ${R_CENTER} 0 1 1 ${-R_CENTER} 0 Z`;

  readonly dientes: DienteSVG[] = [
    ...this.fila(['18', '17', '16', '15', '14', '13', '12', '11'], 'left', 0, ROW.supPerm),
    ...this.fila(['21', '22', '23', '24', '25', '26', '27', '28'], 'right', 0, ROW.supPerm),
    ...this.fila(['55', '54', '53', '52', '51'], 'left', 3, ROW.supTemp),
    ...this.fila(['61', '62', '63', '64', '65'], 'right', 0, ROW.supTemp),
    ...this.fila(['85', '84', '83', '82', '81'], 'left', 3, ROW.infTemp),
    ...this.fila(['71', '72', '73', '74', '75'], 'right', 0, ROW.infTemp),
    ...this.fila(['48', '47', '46', '45', '44', '43', '42', '41'], 'left', 0, ROW.infPerm),
    ...this.fila(['31', '32', '33', '34', '35', '36', '37', '38'], 'right', 0, ROW.infPerm),
  ];

  readonly viewWidth = RIGHT_START + 7 * COL_STEP + R_OUTER + 20;
  readonly viewHeight = ROW.infPerm + 72; // +22 para la cajita de marcas de la fila inferior
  readonly dividerX = (LEFT_START + 7 * COL_STEP + RIGHT_START) / 2;
  readonly dividerY = (ROW.supTemp + ROW.infTemp) / 2;

  /** Ancho del SVG: 100% (ajustado) en zoom 1, o en píxeles al ampliar */
  readonly svgWidth = computed(() => (this.zoom() === 1 ? '100%' : `${this.viewWidth * this.zoom()}px`));

  private fila(teeth: string[], side: 'left' | 'right', startCol: number, cy: number): DienteSVG[] {
    return teeth.map((fdi, i) => ({
      fdi,
      cx: (side === 'left' ? LEFT_START : RIGHT_START) + (startCol + i) * COL_STEP,
      cy,
    }));
  }

  /** ¿Es pieza anterior (incisivo/canino)? Determina oclusal vs incisal */
  esAnterior(fdi: string): boolean {
    return ['1', '2', '3'].includes(fdi[1]);
  }

  /** Segmentos de un anillo (intermedio o cervical) con mesial/distal por cuadrante */
  private anillo(
    fdi: string,
    paths: { top: string; right: string; bottom: string; left: string },
    cervical: boolean
  ): Segmento[] {
    const izq = BLOQUE_IZQ.includes(fdi[0]); // línea media a la derecha del diente
    const s = (base: string): SuperficieDiente =>
      (cervical ? `cervical_${base}` : base) as SuperficieDiente;
    return [
      { superficie: s('vestibular'), d: paths.top },
      { superficie: s('lingual_palatina'), d: paths.bottom },
      { superficie: izq ? s('mesial') : s('distal'), d: paths.right },
      { superficie: izq ? s('distal') : s('mesial'), d: paths.left },
    ];
  }

  /** Anillo intermedio (4 caras) */
  intermedios(fdi: string): Segmento[] {
    return this.anillo(fdi, { top: this.pathTop, right: this.pathRight, bottom: this.pathBottom, left: this.pathLeft }, false);
  }

  /** Anillo cervical (4 caras, tercio exterior) */
  cervicales(fdi: string): Segmento[] {
    return this.anillo(
      fdi,
      { top: this.pathCervTop, right: this.pathCervRight, bottom: this.pathCervBottom, left: this.pathCervLeft },
      true
    );
  }

  estadoDe(fdi: string, superficie: SuperficieDiente): EstadoDiente {
    return this.superficiesMap()[`${fdi}:${superficie}`]?.estado ?? 'sano';
  }

  /** Registro 'ausente' de una pieza (si cualquier superficie está ausente) */
  piezaAusente(fdi: string): PiezaOdontograma | null {
    const map = this.superficiesMap();
    for (const key of Object.keys(map)) {
      if (key.startsWith(`${fdi}:`) && map[key].estado === 'ausente') return map[key];
    }
    return null;
  }

  isSelected(fdi: string, superficie: SuperficieDiente): boolean {
    return this.selPieza() === fdi && this.selSuperficie() === superficie;
  }

  readonly tituloModal = computed(() => {
    const p = this.selPieza();
    const s = this.selSuperficie();
    if (!p || !s) return '';
    let label = this.superficieLabels[s];
    if (s === 'oclusal_incisal') label = this.esAnterior(p) ? 'Incisal' : 'Oclusal';
    return `Pieza ${p} · ${label}`;
  });

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [registros, marcas] = await Promise.all([
        this.odontogramaService.getOdontograma(this.pacienteId()),
        this.odontogramaService.getMarcas(this.pacienteId()),
      ]);
      const map: Record<string, PiezaOdontograma> = {};
      for (const r of registros) map[`${r.pieza}:${r.superficie}`] = r;
      this.superficiesMap.set(map);
      this.marcasPorPieza.set(agruparMarcasPorPieza(marcas));
    } catch (err) {
      console.error('Error cargando odontograma:', err);
      this.error.set('No se pudo cargar el odontograma.');
    } finally {
      this.loading.set(false);
    }
  }

  onSurfaceClick(fdi: string, superficie: SuperficieDiente): void {
    const actual = this.superficiesMap()[`${fdi}:${superficie}`];
    this.selPieza.set(fdi);
    this.selSuperficie.set(superficie);
    this.formEstado.set(actual?.estado ?? 'sano');
    this.formNotas.set(actual?.notas ?? '');
    this.modal()?.open();
  }

  async save(): Promise<void> {
    const pieza = this.selPieza();
    const superficie = this.selSuperficie();
    if (!pieza || !superficie) return;

    this.saving.set(true);
    this.error.set(null);
    try {
      const registro = await this.odontogramaService.saveSuperficie(
        this.pacienteId(),
        pieza,
        superficie,
        this.formEstado(),
        this.formNotas().trim() || null
      );
      this.superficiesMap.update((prev) => ({ ...prev, [`${pieza}:${superficie}`]: registro }));
      this.modal()?.close();
    } catch (err) {
      console.error('Error guardando superficie:', err);
      this.error.set('No se pudo guardar el estado de la superficie.');
    } finally {
      this.saving.set(false);
    }
  }

  onBoxClick(fdi: string): void {
    this.marcaPieza.set(fdi);
    this.modalMarcas()?.open();
  }

  onMarcasClosed(): void {
    this.marcaPieza.set(null);
  }

  closeMarcas(): void {
    this.modalMarcas()?.close();
  }

  /** Toggle optimista: actualiza el signal y revierte si setMarca falla */
  async toggleMarca(marca: MarcaDiente): Promise<void> {
    const pieza = this.marcaPieza();
    if (!pieza) return;
    const previo = this.marcasPorPieza();
    const actuales = previo.get(pieza) ?? [];
    const activa = !actuales.includes(marca);
    const nuevo = new Map(previo);
    nuevo.set(pieza, activa ? [...actuales, marca] : actuales.filter((m) => m !== marca));
    this.marcasPorPieza.set(nuevo);
    this.error.set(null);
    try {
      await this.odontogramaService.setMarca(this.pacienteId(), pieza, marca, activa);
    } catch (err) {
      console.error('Error guardando marca:', err);
      this.marcasPorPieza.set(previo);
      this.error.set('No se pudo guardar la marca.');
    }
  }

  zoomIn(): void {
    this.zoom.update((z) => Math.min(3, z + 0.5));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(1, z - 0.5));
  }

  closeModal(): void {
    this.modal()?.close();
  }

  onModalClosed(): void {
    this.selPieza.set(null);
    this.selSuperficie.set(null);
  }
}
