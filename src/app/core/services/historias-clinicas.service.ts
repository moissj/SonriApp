import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { Patient } from './patient.service';

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

/** Datos de identificación del paciente para la cabecera de la historia clínica */
export interface CabeceraPaciente {
  id: string;
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string | null;
  afiliacion_salud: string | null;
  telefono: string | null;
}

/**
 * Servicio del módulo independiente de Historias Clínicas.
 * Consulta la misma tabla `historias_clinicas` de Supabase, pero con identidad
 * propia respecto al módulo de pacientes.
 */
@Injectable({ providedIn: 'root' })
export class HistoriasClinicasService {
  private readonly auth = inject(AuthService);

  /** Datos de identificación del paciente para el encabezado fijo */
  async getCabeceraPaciente(pacienteId: string): Promise<CabeceraPaciente | null> {
    const user = this.auth.user();
    if (!user) return null;

    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, tipo_documento, numero_documento, fecha_nacimiento, afiliacion_salud, telefono')
      .eq('id', pacienteId)
      .eq('odontologo_id', user.id)
      .single();

    if (error) throw error;
    return data as CabeceraPaciente;
  }

  /** Evoluciones/consultas de un paciente, más recientes primero */
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

  /** Crea una nueva entrada de evolución (fecha = hoy por defecto) */
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
