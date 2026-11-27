import { signal, computed, WritableSignal } from '@angular/core';
import { OdontogramaService, EstadoDiente, MarcaDiente, OdontogramaTipo, SuperficieDiente } from '../../../../../core/services/odontograma.service';
import { CATALOGO_HALLAZGOS, HallazgoDef } from './catalogo-hallazgos';
import { conflictos } from './compatibilidad-hallazgos';
import { PilaEdicion, OpEdicion, MapaSuperficies, invertir, auditoriaDeOp, conEstado, conMarca } from './editor-odontograma';

export type EstadoGuardado = 'idle' | 'guardando' | 'guardado' | 'error';
export interface MenuCtx { pieza: string; x: number; y: number }
type MapaMarcas = Map<string, MarcaDiente[]>;

const hora = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });

/** Estado y acciones del editor (herramienta, autosave, undo/redo, menú, toast). Cada op: optimista -> persiste -> audita -> pila. */
export class EdicionOdontograma {
  readonly herramienta = signal<string | null>(null); // id de hallazgo | 'goma'
  readonly dienteSel = signal<string | null>(null);
  readonly menu = signal<MenuCtx | null>(null);
  readonly toast = signal<string | null>(null);
  readonly estadoGuardado = signal<EstadoGuardado>('idle');
  readonly horaGuardado = signal('');
  readonly puedeUndo = signal(false);
  readonly puedeRedo = signal(false);
  readonly def = computed(() => CATALOGO_HALLAZGOS.find((h) => h.id === this.herramienta()));
  private readonly pila = new PilaEdicion();
  private grupo = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly svc: OdontogramaService,
    private readonly pacienteId: () => string,
    private readonly tipo: () => OdontogramaTipo,
    private readonly superficies: WritableSignal<MapaSuperficies>,
    private readonly marcas: WritableSignal<MapaMarcas>,
    private readonly onError: (m: string | null) => void,
  ) {}

  destroy(): void { clearTimeout(this.timer); }
  elegir(id: string): void { this.herramienta.update((a) => (a === id ? null : id)); }

  estadoDe = (pieza: string, s: SuperficieDiente): EstadoDiente => this.superficies()[`${pieza}:${s}`]?.estado ?? 'sano';

  async clickZona(pieza: string, s: SuperficieDiente): Promise<void> {
    this.dienteSel.set(pieza);
    const h = this.herramienta();
    const d = this.def();
    const despues: EstadoDiente | undefined = h === 'goma' ? 'sano' : d?.estadoEnum;
    if (!despues) return;
    const op = this.opFill(pieza, s, despues);
    if (op) await this.hacer([op], despues === 'sano');
  }

  async clickDiente(pieza: string): Promise<boolean> {
    this.dienteSel.set(pieza);
    if (this.herramienta() === 'goma') { await this.quitarUltima(pieza); return true; }
    const m = this.def()?.marcaEnum;
    if (!m) return false; // sin herramienta de marca: el componente abre el modal de marcas
    await this.alternarMarca(pieza, m);
    return true;
  }

  async alternarMarca(pieza: string, marca: MarcaDiente): Promise<void> {
    const actuales = this.marcas().get(pieza) ?? [];
    const agrega = !actuales.includes(marca);
    const ops = [...(agrega ? conflictos(actuales, marca) : []).map((m) => this.opMarca(pieza, m, false)), this.opMarca(pieza, marca, agrega)];
    await this.hacer(ops, !agrega);
  }

  async quitarHallazgo(pieza: string, hallazgoId: string): Promise<void> {
    const m = CATALOGO_HALLAZGOS.find((h) => h.id === hallazgoId)?.marcaEnum;
    if (m && (this.marcas().get(pieza) ?? []).includes(m)) await this.hacer([this.opMarca(pieza, m, false)], true);
  }

  async quitarUltima(pieza: string): Promise<void> {
    const ms = this.marcas().get(pieza) ?? [];
    if (ms.length) await this.hacer([this.opMarca(pieza, ms[ms.length - 1], false)], true);
  }

  async marcarSano(pieza: string): Promise<void> {
    if (!(this.marcas().get(pieza) ?? []).includes('sano')) await this.alternarMarca(pieza, 'sano');
  }

  /** Quita todas las marcas y fills de la pieza como un solo grupo deshacible. */
  async limpiarDiente(pieza: string): Promise<void> {
    const ops = (this.marcas().get(pieza) ?? []).map((m) => this.opMarca(pieza, m, false));
    for (const k of Object.keys(this.superficies())) {
      const [p, s] = k.split(':');
      const op = p === pieza ? this.opFill(p, s as SuperficieDiente, 'sano') : null;
      if (op) ops.push(op);
    }
    if (ops.length) await this.hacer(ops, true);
  }

  async deshacer(): Promise<void> { await this.mover(() => this.pila.undoGrupo(), () => this.pila.redoGrupo(), true); }
  async rehacer(): Promise<void> { await this.mover(() => this.pila.redoGrupo(), () => this.pila.undoGrupo(), false); }

  /** Deshace toda la sesión (hasta vaciar la pila); se detiene ante un fallo. */
  async descartar(): Promise<void> {
    while (this.pila.puedeUndo && this.estadoGuardado() !== 'error') await this.deshacer();
  }

  abrirMenu(e: MouseEvent, pieza: string): void {
    e.preventDefault();
    this.dienteSel.set(pieza);
    this.menu.set({ pieza, x: e.clientX, y: e.clientY });
    setTimeout(() => document.getElementById('odo-menu-1')?.focus());
  }

  /** Atajos: E goma, Supr limpia el diente seleccionado, Esc deselecciona, Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y. */
  onKey(e: KeyboardEvent): void {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && k === 'z') { e.preventDefault(); void (e.shiftKey ? this.rehacer() : this.deshacer()); }
    else if (ctrl && k === 'y') { e.preventDefault(); void this.rehacer(); }
    else if (ctrl || e.altKey) return;
    else if (k === 'e') this.herramienta.set('goma');
    else if (k === 'escape') { if (this.menu()) this.menu.set(null); else { this.herramienta.set(null); this.dienteSel.set(null); } }
    else if (k === 'delete' && this.dienteSel()) void this.limpiarDiente(this.dienteSel() as string);
  }

  private opMarca(pieza: string, marca: MarcaDiente, presente: boolean): OpEdicion {
    const h = CATALOGO_HALLAZGOS.find((x: HallazgoDef) => x.marcaEnum === marca);
    return { clase: 'marca', pieza, hallazgoId: h?.id ?? marca, antes: !presente, despues: presente };
  }

  private opFill(pieza: string, s: SuperficieDiente, despues: EstadoDiente): OpEdicion | null {
    const antes = this.estadoDe(pieza, s);
    if (antes === despues) return null;
    const h = CATALOGO_HALLAZGOS.find((x) => x.estadoEnum === (despues === 'sano' ? antes : despues));
    return { clase: 'fill', pieza, hallazgoId: h?.id ?? despues, superficie: s, antes, despues };
  }

  private async hacer(ops: OpEdicion[], avisaQuitar: boolean): Promise<void> {
    const g = ++this.grupo;
    const conGrupo = ops.map((o) => ({ ...o, grupo: g }));
    if (!(await this.aplicar(conGrupo))) return;
    conGrupo.forEach((o) => this.pila.push(o));
    this.sync();
    if (avisaQuitar) this.avisar('Hallazgo eliminado');
  }

  private async mover(sacar: () => OpEdicion[], devolver: () => OpEdicion[], deshaciendo: boolean): Promise<void> {
    const ops = sacar();
    if (!ops.length) return;
    const orientadas = deshaciendo ? ops.map(invertir) : ops;
    if (!(await this.aplicar(orientadas))) devolver(); // la op vuelve a su pila de origen
    this.sync();
  }

  private sync(): void {
    this.puedeUndo.set(this.pila.puedeUndo);
    this.puedeRedo.set(this.pila.puedeRedo);
  }

  /** Optimista -> persiste en paralelo -> audita; ante error revierte el estado local. */
  private async aplicar(ops: OpEdicion[]): Promise<boolean> {
    const prev = { s: this.superficies(), m: this.marcas() };
    ops.forEach((o) => this.pintar(o));
    this.estadoGuardado.set('guardando');
    this.onError(null);
    try {
      await Promise.all(ops.map((o) => this.persistir(o)));
      await Promise.all(ops.flatMap((o) => auditoriaDeOp(o)).map((c) => this.svc.registrarCambio(this.pacienteId(), { ...c, tipo: this.tipo() })));
      this.horaGuardado.set(hora.format(new Date()));
      this.estadoGuardado.set('guardado');
      return true;
    } catch {
      this.superficies.set(prev.s);
      this.marcas.set(prev.m);
      this.estadoGuardado.set('error');
      this.onError('No se pudo guardar el cambio.');
      return false;
    }
  }

  private pintar(o: OpEdicion): void {
    if (o.clase === 'marca') this.marcas.update((m) => conMarca(m, o.pieza, this.marcaDe(o), !!o.despues));
    else this.superficies.update((m) => conEstado(m, this.pacienteId(), o.pieza, o.superficie as SuperficieDiente, (o.despues ?? 'sano') as EstadoDiente));
  }

  private marcaDe(o: OpEdicion): MarcaDiente {
    return CATALOGO_HALLAZGOS.find((h) => h.id === o.hallazgoId)?.marcaEnum as MarcaDiente;
  }

  private async persistir(o: OpEdicion): Promise<void> {
    const id = this.pacienteId();
    if (o.clase === 'marca') return this.svc.setMarca(id, o.pieza, this.marcaDe(o), !!o.despues, this.tipo());
    const s = o.superficie as SuperficieDiente;
    const previo = this.superficies()[`${o.pieza}:${s}`];
    const reg = await this.svc.saveSuperficie(id, o.pieza, s, (o.despues ?? 'sano') as EstadoDiente, previo?.notas ?? null, this.tipo());
    this.superficies.update((m) => ({ ...m, [`${o.pieza}:${s}`]: reg }));
  }

  private avisar(texto: string): void {
    this.toast.set(texto);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(null), 5000);
  }
}
