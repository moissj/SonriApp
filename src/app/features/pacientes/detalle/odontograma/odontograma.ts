import { Component, ChangeDetectionStrategy, inject, input, signal, computed, viewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { OdontogramaService, PiezaOdontograma, SuperficieDiente, MarcaDiente, OdontogramaTipo } from '../../../../core/services/odontograma.service';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';
import { agruparMarcasPorPieza } from '../../../../core/funciones/marcas-odontograma.funcion';
import { hallazgosMarca, leyendaHallazgos, glifoDe } from './funciones/catalogo-hallazgos';
import { vistaDePieza, VistaPieza } from './funciones/vista-marcas.funcion';
import { EdicionOdontograma } from './funciones/edicion-odontograma';
import * as geo from './funciones/geometria-odontograma.funcion';
import { etiquetaZona } from './funciones/etiquetas-odontograma.funcion';

@Component({
  selector: 'app-odontograma',
  standalone: true,
  imports: [ModalComponent, ConfirmModalComponent],
  templateUrl: './odontograma.html',
  styleUrl: './odontograma.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdontogramaComponent implements OnInit, OnDestroy {
  private readonly odontogramaService = inject(OdontogramaService);

  readonly pacienteId = input.required<string>();
  readonly tipo = input<OdontogramaTipo>('inicial');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  /** Estado por superficie: clave `${pieza}:${superficie}` -> registro */
  private readonly superficiesMap = signal<Record<string, PiezaOdontograma>>({});
  /** Marcas nivel-diente: pieza -> marcas activas */
  readonly marcasPorPieza = signal<Map<string, MarcaDiente[]>>(new Map());

  /** Estado del editor: herramienta, autosave, undo/redo, menú contextual y toast */
  readonly ed = new EdicionOdontograma(
    this.odontogramaService, () => this.pacienteId(), () => this.tipo(), this.superficiesMap, this.marcasPorPieza, (m) => this.error.set(m),
  );

  /** Zoom: 1 = ajustado al ancho; >1 = ampliado con scroll (mejor toque en móvil) */
  readonly zoom = signal(1);
  private readonly modalMarcas = viewChild<ModalComponent>('modalMarcas');
  private readonly confirmDescartar = viewChild<ConfirmModalComponent>('confirmDescartar');
  readonly marcaPieza = signal<string | null>(null);
  readonly marcasSel = computed(() => this.marcasPorPieza().get(this.marcaPieza() ?? '') ?? []);
  /** Recuadro y figuras por pieza ya resueltos (evita crear arrays en el template) */
  readonly vistaPorPieza = computed(() => {
    const out = new Map<string, VistaPieza>();
    for (const [p, ms] of this.marcasPorPieza()) out.set(p, vistaDePieza(ms));
    return out;
  });

  readonly hallazgosMarca = hallazgosMarca().map((h) => ({ ...h, glifo: glifoDe(h) }));
  /** Leyenda y paleta de la toolbar (mismo catálogo agrupado) */
  readonly leyenda = leyendaHallazgos();

  /** Geometría protegida (constantes y paths) expuesta al template */
  readonly geo = geo;
  readonly intermedios = (fdi: string) => geo.segmentosAnillo(fdi, false);
  readonly cervicales = (fdi: string) => geo.segmentosAnillo(fdi, true);

  /** Ancho del SVG: 100% (ajustado) en zoom 1, o en píxeles al ampliar */
  readonly svgWidth = computed(() => (this.zoom() === 1 ? '100%' : `${geo.VIEW_WIDTH * this.zoom()}px`));

  estadoDe(fdi: string, superficie: SuperficieDiente) {
    return this.ed.estadoDe(fdi, superficie);
  }

  /** Resalta las superficies del diente seleccionado (la superficie no distingue: se marca la pieza entera). */
  isSelected(fdi: string, _superficie: SuperficieDiente): boolean {
    return this.ed.dienteSel() === fdi;
  }

  etiquetaZona(fdi: string, superficie: SuperficieDiente): string {
    return etiquetaZona(fdi, superficie, this.estadoDe(fdi, superficie));
  }

  /** Registro 'ausente' de una pieza (si cualquier superficie está ausente) */
  piezaAusente(fdi: string): PiezaOdontograma | null {
    const map = this.superficiesMap();
    for (const key of Object.keys(map)) {
      if (key.startsWith(`${fdi}:`) && map[key].estado === 'ausente') return map[key];
    }
    return null;
  }

  ngOnInit(): void {
    void this.load();
  }

  ngOnDestroy(): void {
    this.ed.destroy();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    this.ed.onKey(e);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [registros, marcas] = await Promise.all([
        this.odontogramaService.getOdontograma(this.pacienteId(), this.tipo()),
        this.odontogramaService.getMarcas(this.pacienteId(), this.tipo()),
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
    void this.ed.clickZona(fdi, superficie);
  }

  /** Con herramienta de marca/goma actúa; sin ella abre el modal de marcas (fallback) */
  async onBoxClick(fdi: string): Promise<void> {
    if (await this.ed.clickDiente(fdi)) return;
    this.marcaPieza.set(fdi);
    this.modalMarcas()?.open();
  }

  onMarcasClosed(): void {
    this.marcaPieza.set(null);
  }

  closeMarcas = (): void => this.modalMarcas()?.close();

  toggleMarca(marca: MarcaDiente): void {
    const pieza = this.marcaPieza();
    if (pieza) void this.ed.alternarMarca(pieza, marca);
  }

  /** Acción del menú contextual y cierre */
  accionMenu(accion: 'sano' | 'limpiar' | 'ultimo'): void {
    const pieza = this.ed.menu()?.pieza;
    this.ed.menu.set(null);
    if (!pieza) return;
    if (accion === 'sano') void this.ed.marcarSano(pieza);
    else if (accion === 'limpiar') void this.ed.limpiarDiente(pieza);
    else void this.ed.quitarUltima(pieza);
  }

  pedirDescartar(): void {
    this.confirmDescartar()?.open();
  }

  zoomIn(): void {
    this.zoom.update((z) => Math.min(3, z + 0.5));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(1, z - 0.5));
  }
}
