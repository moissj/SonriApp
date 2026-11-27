import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { hoyBogota } from '../funciones/fecha-bogota.funcion';
import { filaAMarca } from '../funciones/marcas-odontograma.funcion';
import { filaAMeta } from '../funciones/meta-odontograma.funcion';

export type MarcaDiente =
  | 'obt_temporal'
  | 'incluido_semi'
  | 'superficie_sellada'
  | 'corona_acero'
  | 'nucleo'
  | 'sano'
  | 'endo_realizada'
  | 'endo_indicada'
  | 'sin_erupcionar'
  | 'ausente'
  | 'resto_radicular'
  | 'exodoncia_indicada'
  | 'sellante_indicado'
  | 'pontico'
  | 'protesis_removible'
  | 'erosion';

export type OdontogramaTipo = 'inicial' | 'final';
export type AccionOdontograma = 'agrega' | 'quita';

export interface CambioAuditoria {
  pieza: string;
  hallazgoId: string;
  accion: AccionOdontograma;
  tipo?: OdontogramaTipo;
  superficie?: string;
  detalle?: unknown;
}

export type OdontogramaCierre ='borrador' | 'cerrado';

export interface OdontogramaMeta {
  id: string;
  odontologo_id: string;
  paciente_id: string;
  tipo: OdontogramaTipo;
  estado: OdontogramaCierre;
  fecha: string;
  creado_por: string | null;
  cerrado_en: string | null;
  notas: string | null;
}

export interface MarcaOdontograma {
  id: string;
  odontologo_id: string;
  paciente_id: string;
  pieza: string;
  marca: MarcaDiente;
  notas: string | null;
  fecha: string;
  updated_at?: string;
}

export type EstadoDiente =
  | 'sano'
  | 'caries'
  | 'obturado'
  | 'ausente'
  | 'corona'
  | 'endodoncia'
  | 'implante'
  | 'obt_desadaptada'
  | 'resina'
  | 'amalgama';

/** Superficie/tercio de una pieza dental */
export type SuperficieDiente =
  | 'vestibular'
  | 'lingual_palatina'
  | 'mesial'
  | 'distal'
  | 'oclusal_incisal'
  | 'cervical_vestibular'
  | 'cervical_lingual_palatina'
  | 'cervical_mesial'
  | 'cervical_distal';

export interface PiezaOdontograma {
  id: string;
  odontologo_id: string;
  paciente_id: string;
  pieza: string;
  superficie: SuperficieDiente;
  estado: EstadoDiente;
  notas: string | null;
  fecha: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class OdontogramaService {
  private readonly auth = inject(AuthService);

  /** Registros del odontograma de un paciente */
  async getOdontograma(pacienteId: string, tipo: OdontogramaTipo = 'inicial'): Promise<PiezaOdontograma[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('odontogramas')
      .select('*')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .eq('tipo', tipo);

    if (error) throw error;
    return (data ?? []) as PiezaOdontograma[];
  }

  /**
   * Guarda (upsert) el estado de una superficie de una pieza. Mantiene un
   * único registro por (paciente, pieza, superficie, tipo) con la fecha de cambio.
   */
  async saveSuperficie(
    pacienteId: string,
    pieza: string,
    superficie: SuperficieDiente,
    estado: EstadoDiente,
    notas: string | null,
    tipo: OdontogramaTipo = 'inicial'
  ): Promise<PiezaOdontograma> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('odontogramas')
      .upsert(
        {
          odontologo_id: user.id,
          paciente_id: pacienteId,
          pieza,
          superficie,
          tipo,
          estado,
          notas,
          fecha: hoyBogota(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'paciente_id,pieza,superficie,tipo' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as PiezaOdontograma;
  }

  /** Marcas a nivel diente de un paciente (RLS filtra por odontólogo). */
  async getMarcas(pacienteId: string, tipo: OdontogramaTipo = 'inicial'): Promise<MarcaOdontograma[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('odontograma_marcas')
      .select('id, odontologo_id, paciente_id, pieza, marca, notas, fecha, updated_at')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .eq('tipo', tipo);

    if (error) throw error;
    return (data ?? []).map(filaAMarca);
  }

  /** Activa (inserta) o desactiva (borra) una marca de una pieza. */
  async setMarca(
    pacienteId: string,
    pieza: string,
    marca: MarcaDiente,
    activa: boolean,
    tipo: OdontogramaTipo = 'inicial'
  ): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    if (activa) {
      const { error } = await supabase.from('odontograma_marcas').upsert(
        { odontologo_id: user.id, paciente_id: pacienteId, pieza, marca, tipo, fecha: hoyBogota() },
        { onConflict: 'paciente_id,pieza,marca,tipo', ignoreDuplicates: true }
      );
      if (error) throw error;
      return;
    }

    const { error } = await supabase
      .from('odontograma_marcas')
      .delete()
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .eq('pieza', pieza)
      .eq('marca', marca)
      .eq('tipo', tipo);
    if (error) throw error;
  }

  /** Estado de cierre (borrador/cerrado) de los odontogramas del paciente. */
  async getMeta(pacienteId: string): Promise<OdontogramaMeta[]> {
    const user = this.auth.user();
    if (!user) return [];
    const { data, error } = await supabase
      .from('odontograma_meta')
      .select('id, odontologo_id, paciente_id, tipo, estado, fecha, creado_por, cerrado_en, notas')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId);
    if (error) throw error;
    return (data ?? []).map(filaAMeta);
  }

  /** Cierra el odontograma del tipo dado (upsert de su meta). */
  async cerrar(pacienteId: string, tipo: OdontogramaTipo, creadoPor?: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');
    const ahora = new Date().toISOString();
    const { error } = await supabase.from('odontograma_meta').upsert(
      {
        odontologo_id: user.id,
        paciente_id: pacienteId,
        tipo,
        estado: 'cerrado',
        fecha: hoyBogota(),
        creado_por: creadoPor ?? user.id,
        cerrado_en: ahora,
        updated_at: ahora,
      },
      { onConflict: 'paciente_id,tipo' }
    );
    if (error) throw error;
  }

  /** Reabre un odontograma cerrado; el motivo queda en `notas` (auditoría formal: F4). */
  async reabrir(pacienteId: string, tipo: OdontogramaTipo, motivo: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');
    if (!motivo.trim()) throw new Error('El motivo de reapertura es obligatorio.');
    const { error } = await supabase
      .from('odontograma_meta')
      .update({ estado: 'borrador', cerrado_en: null, notas: motivo.trim(), updated_at: new Date().toISOString() })
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .eq('tipo', tipo);
    if (error) throw error;
  }

  /**
   * Crea el odontograma final en borrador; si `copiarDesdeInicial`, copia primero superficies y marcas
   * del inicial. La meta se escribe al final (es el "commit"): si la copia falla, reintentar es seguro
   * (todo es upsert con ignoreDuplicates, nunca pisa ni reabre un final existente).
   */
  async crearFinal(pacienteId: string, copiarDesdeInicial: boolean): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');
    const base = { odontologo_id: user.id, paciente_id: pacienteId, tipo: 'final', fecha: hoyBogota() };
    if (copiarDesdeInicial) {
      const [sup, marcas] = await Promise.all([this.getOdontograma(pacienteId, 'inicial'), this.getMarcas(pacienteId, 'inicial')]);
      const filasSup = sup.map((s) => ({ ...base, pieza: s.pieza, superficie: s.superficie, estado: s.estado, notas: s.notas }));
      const filasMarcas = marcas.map((m) => ({ ...base, pieza: m.pieza, marca: m.marca, notas: m.notas }));
      if (filasSup.length) {
        const { error } = await supabase.from('odontogramas').upsert(filasSup, { onConflict: 'paciente_id,pieza,superficie,tipo', ignoreDuplicates: true });
        if (error) throw error;
      }
      if (filasMarcas.length) {
        const { error } = await supabase.from('odontograma_marcas').upsert(filasMarcas, { onConflict: 'paciente_id,pieza,marca,tipo', ignoreDuplicates: true });
        if (error) throw error;
      }
    }
    const { error } = await supabase.from('odontograma_meta').upsert(
      { ...base, estado: 'borrador', creado_por: user.id },
      { onConflict: 'paciente_id,tipo', ignoreDuplicates: true }
    );
    if (error) throw error;
  }

  /**
   * Registra un cambio en la auditoría append-only. Falla suave a propósito: un fallo
   * de auditoría no debe bloquear el autosave clínico. No se loguea el error (puede
   * traer valores de fila); solo un aviso estructural.
   */
  async registrarCambio(pacienteId: string, cambio: CambioAuditoria): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    const { error } = await supabase.from('odontograma_auditoria').insert({
      odontologo_id: user.id,
      creado_por: user.id,
      paciente_id: pacienteId,
      tipo: cambio.tipo ?? 'inicial',
      pieza: cambio.pieza,
      hallazgo_id: cambio.hallazgoId,
      accion: cambio.accion,
      superficie: cambio.superficie ?? null,
      detalle: cambio.detalle ?? null,
    });
    if (error) console.warn('odontograma: no se pudo registrar auditoría', error.code);
  }
}
