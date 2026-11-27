import { signal, computed, WritableSignal } from '@angular/core';
import { OdontogramaService, OdontogramaMeta, OdontogramaTipo } from '../../../../../core/services/odontograma.service';
import { fechaLargaBogota } from '../../../../../core/funciones/fecha-bogota.funcion';
import { editorBloqueado, metaDe } from './estado-meta.funcion';

/** Ciclo de vida del odontograma: meta (borrador/cerrado), crear final, cerrar y reabrir. */
export class CicloOdontograma {
  /** null = no cargada o fallo de carga (el editor queda bloqueado, fail-closed). */
  readonly metas = signal<OdontogramaMeta[] | null>(null);
  readonly ocupado = signal(false);
  readonly meta = computed(() => metaDe(this.metas() ?? [], this.tipoActivo()));
  readonly existeFinal = computed(() => !!metaDe(this.metas() ?? [], 'final'));
  readonly bloqueado = computed(() => editorBloqueado(this.metas(), this.tipoActivo()));
  readonly cerrado = computed(() => this.meta()?.estado === 'cerrado');
  readonly necesitaCrear = computed(() => this.metas() !== null && this.tipoActivo() === 'final' && !this.existeFinal());
  readonly fechaCierre = computed(() => {
    const c = this.meta()?.cerrado_en;
    return c ? fechaLargaBogota(new Date(c)) : '';
  });

  constructor(
    private readonly svc: OdontogramaService,
    private readonly pacienteId: () => string,
    readonly tipoActivo: WritableSignal<OdontogramaTipo>,
    private readonly recargar: () => Promise<void>,
    private readonly onError: (m: string | null) => void,
  ) {}

  async cargarMetas(): Promise<void> {
    try {
      this.metas.set(await this.svc.getMeta(this.pacienteId()));
    } catch {
      this.metas.set(null);
      this.onError('No se pudo cargar el estado del odontograma.');
    }
  }

  crear(copiar: boolean): Promise<void> {
    return this.accion('No se pudo crear el odontograma final.', () => this.svc.crearFinal(this.pacienteId(), copiar));
  }

  cerrar(): Promise<void> {
    return this.accion('No se pudo cerrar el odontograma.', () => this.svc.cerrar(this.pacienteId(), this.tipoActivo()));
  }

  reabrir(motivo: string): Promise<void> {
    return this.accion('No se pudo reabrir el odontograma.', () => this.svc.reabrir(this.pacienteId(), this.tipoActivo(), motivo));
  }

  /** Ejecuta, recarga meta y datos; un fallo muestra error y nunca un éxito. */
  private async accion(msg: string, fn: () => Promise<void>): Promise<void> {
    this.ocupado.set(true);
    this.onError(null);
    try {
      await fn();
      await this.recargar();
    } catch {
      this.onError(msg);
    } finally {
      this.ocupado.set(false);
    }
  }
}
