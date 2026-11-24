import { Injectable, inject } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { AuthService } from '../../../core/services/auth.service';

export interface ChecklistEntry {
  nombre: string;
  valor: string | null;
  observacion: string;
}

export interface HistorialDentalItem {
  valor: string | null;   // 'si' | 'no' | 'normal' | 'alterado' | null
  observacion?: string;
  lado?: string | null;  // 'derecho' | 'izquierdo' | null
}

export interface HistoriaDental {
  tratamiento_ortopedico: HistorialDentalItem;
  recambio_tardio: HistorialDentalItem;
  dolor_atm: HistorialDentalItem;
  ruido_articular: HistorialDentalItem;
  apertura: HistorialDentalItem;
  desviacion_apertura: HistorialDentalItem;
  ausencias_congenitas: HistorialDentalItem;
  succion_digital: HistorialDentalItem;
  habito_lengua: HistorialDentalItem;
  habito_unas: HistorialDentalItem;
  chupete: HistorialDentalItem;
  traumas_quistes: HistorialDentalItem;
  sensibilidad: HistorialDentalItem;
  cuellos_expuestos: HistorialDentalItem;
  habitos_orales: HistorialDentalItem;
  supernumerarios: HistorialDentalItem;
  sellantes: HistorialDentalItem;
  frecuencia_cepillado: HistorialDentalItem; // valor '1'..'6'
  uso_seda: HistorialDentalItem;
  uso_enjuague: HistorialDentalItem;
}

export interface LateralidadMordida {
  valor: string | null;
  anterior: boolean;
  posterior: boolean;
  izquierda: boolean;
  derecha: boolean;
}

export interface AnomaliasPosicion {
  rotaciones: string | null;
  diastemas: string | null;
  translocaciones: string | null;
  giroversiones: string | null;
  ausencias: string | null;
  retenidos: string | null;
  apinamientos: string | null;
  descripcion: string;
}

export interface ExploracionFacial {
  perfil: string | null;
  asimetria_facial: string | null;
  asimetria_obs: string;
  forma_cara: string | null;
  patron_crecimiento: string | null;
  nariz: string | null;
  posicion_labial: string;
  respirador_oral: string | null;
  ronca: string | null;
  apnea_sueno: string | null;
  apnea_diagnosticada: string | null; // 'si'|'no'|'alterada'
  uso_cpap: string | null;
  aparato_removible_no_cpap: string | null;
  menton: string | null;
  ojeras: string | null;
  mordida_abierta: LateralidadMordida;
  mordida_cruzada: LateralidadMordida;
  mordida_profunda: LateralidadMordida;
  anomalias: AnomaliasPosicion;
  planos_terminales: string | null;
  tipo_denticion: string | null;
  descripcion_modelos: string;
}

export interface HistoriaClinicaInicial {
  id?: string;
  paciente_id: string;
  odontologo_id?: string;
  antecedentes_salud: ChecklistEntry[];
  obs_antecedentes: string;
  toma_presion: string;
  temperatura_corporal: number | null;
  tejidos_blandos: ChecklistEntry[];
  obs_tejidos_blandos: string;
  respiracion: string | null;
  deglucion: string | null;
  fonacion: string | null;
  succion: string | null;
  historia_dental: HistoriaDental;
  exploracion_facial: ExploracionFacial;
  plan_tratamiento: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamenIngresoService {
  private readonly auth = inject(AuthService);

  async getOrNull(pacienteId: string): Promise<HistoriaClinicaInicial | null> {
    const user = this.auth.user();
    if (!user) return null;

    const { data, error } = await supabase
      .from('historia_clinica_inicial')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('odontologo_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data as HistoriaClinicaInicial | null;
  }

  async upsert(pacienteId: string, payload: Omit<HistoriaClinicaInicial, 'id' | 'paciente_id' | 'odontologo_id' | 'created_at' | 'updated_at'>): Promise<HistoriaClinicaInicial> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('historia_clinica_inicial')
      .upsert(
        {
          paciente_id: pacienteId,
          odontologo_id: user.id,
          ...payload,
        },
        { onConflict: 'paciente_id,odontologo_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as HistoriaClinicaInicial;
  }
}
