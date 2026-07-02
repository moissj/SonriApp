import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface HistoriaClinica {
  id: string;
  paciente_id: string;
  odontologo_id: string;
  fecha: string;
  motivo_consulta: string;
  diagnostico: string | null;
  notas_clinicas: string | null;
  created_at?: string;
}

export type NuevaHistoria = Pick<
  HistoriaClinica,
  'motivo_consulta' | 'diagnostico' | 'notas_clinicas'
>;

@Injectable({ providedIn: 'root' })
export class HistoriaService {
  private readonly auth = inject(AuthService);

  /** Historias clínicas de un paciente, más recientes primero */
  async getHistorias(pacienteId: string): Promise<HistoriaClinica[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('historias_clinicas')
      .select('*')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as HistoriaClinica[];
  }

  /** Crea una nueva entrada de historia clínica (fecha = hoy por defecto) */
  async addHistoria(pacienteId: string, entrada: NuevaHistoria): Promise<HistoriaClinica> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('historias_clinicas')
      .insert({
        paciente_id: pacienteId,
        odontologo_id: user.id,
        motivo_consulta: entrada.motivo_consulta,
        diagnostico: entrada.diagnostico,
        notas_clinicas: entrada.notas_clinicas,
      })
      .select()
      .single();

    if (error) throw error;
    return data as HistoriaClinica;
  }
}
