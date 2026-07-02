import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export type EstadoDiente =
  | 'sano'
  | 'caries'
  | 'obturado'
  | 'ausente'
  | 'corona'
  | 'endodoncia'
  | 'implante';

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
  async getOdontograma(pacienteId: string): Promise<PiezaOdontograma[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('odontogramas')
      .select('*')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId);

    if (error) throw error;
    return (data ?? []) as PiezaOdontograma[];
  }

  /**
   * Guarda (upsert) el estado de una superficie de una pieza. Mantiene un
   * único registro por (paciente, pieza, superficie) con la fecha de cambio.
   */
  async saveSuperficie(
    pacienteId: string,
    pieza: string,
    superficie: SuperficieDiente,
    estado: EstadoDiente,
    notas: string | null
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
          estado,
          notas,
          fecha: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'paciente_id,pieza,superficie' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as PiezaOdontograma;
  }
}
