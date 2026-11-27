import { Component, ChangeDetectionStrategy, inject, input, signal, computed, viewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OdontogramaService, PiezaOdontograma, EstadoDiente, SuperficieDiente, MarcaDiente } from '../../../../core/services/odontograma.service';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { agruparMarcasPorPieza } from '../../../../core/funciones/marcas-odontograma.funcion';
import { hallazgosFill, hallazgosMarca, leyendaHallazgos, glifoDe } from './funciones/catalogo-hallazgos';
import { aplicarToggle, conflictos } from './funciones/compatibilidad-hallazgos';
import { vistaDePieza, VistaPieza } from './funciones/vista-marcas.funcion';
import * as geo from './funciones/geometria-odontograma.funcion';
import { etiquetaZona, tituloSuperficie } from './funciones/etiquetas-odontograma.funcion';

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
  readonly marcaPieza = signal<string | null>(null);
  readonly marcasSel = computed(() => this.marcasPorPieza().get(this.marcaPieza() ?? '') ?? []);
  /** Recuadro y figuras por pieza ya resueltos (evita crear arrays en el template) */
  readonly vistaPorPieza = computed(() => {
    const out = new Map<string, VistaPieza>();
    for (const [p, ms] of this.marcasPorPieza()) out.set(p, vistaDePieza(ms));
    return out;
  });

  /** Selector de superficie: solo fills del catálogo */
  readonly estados = hallazgosFill().map((h) => ({ value: h.estadoEnum as EstadoDiente, label: h.label }));
  readonly hallazgosMarca = hallazgosMarca().map((h) => ({ ...h, glifo: glifoDe(h) }));
  readonly leyenda = leyendaHallazgos();

  /** Geometría protegida (constantes y paths) expuesta al template */
  readonly geo = geo;
  readonly intermedios = (fdi: string) => geo.segmentosAnillo(fdi, false);
  readonly cervicales = (fdi: string) => geo.segmentosAnillo(fdi, true);

  /** Ancho del SVG: 100% (ajustado) en zoom 1, o en píxeles al ampliar */
  readonly svgWidth = computed(() => (this.zoom() === 1 ? '100%' : `${geo.VIEW_WIDTH * this.zoom()}px`));

  estadoDe(fdi: string, superficie: SuperficieDiente): EstadoDiente {
    return this.superficiesMap()[`${fdi}:${superficie}`]?.estado ?? 'sano';
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

  isSelected(fdi: string, superficie: SuperficieDiente): boolean {
    return this.selPieza() === fdi && this.selSuperficie() === superficie;
  }

  readonly tituloModal = computed(() => {
    const p = this.selPieza();
    const s = this.selSuperficie();
    return p && s ? tituloSuperficie(p, s) : '';
  });

  ngOnInit(): void {
    void this.load();
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

  closeMarcas = (): void => this.modalMarcas()?.close();

  /** Toggle optimista con reglas de compatibilidad; revierte todo si algún setMarca falla */
  async toggleMarca(marca: MarcaDiente): Promise<void> {
    const pieza = this.marcaPieza();
    if (!pieza) return;
    const previo = this.marcasPorPieza();
    const actuales = previo.get(pieza) ?? [];
    const activa = !actuales.includes(marca);
    const quitar = activa ? conflictos(actuales, marca) : [];
    this.marcasPorPieza.set(new Map(previo).set(pieza, aplicarToggle(actuales, marca)));
    this.error.set(null);
    try {
      const id = this.pacienteId();
      await Promise.all([
        ...quitar.map((m) => this.odontogramaService.setMarca(id, pieza, m, false)),
        this.odontogramaService.setMarca(id, pieza, marca, activa),
      ]);
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

  closeModal = (): void => this.modal()?.close();

  onModalClosed(): void {
    this.selPieza.set(null);
    this.selSuperficie.set(null);
  }
}
