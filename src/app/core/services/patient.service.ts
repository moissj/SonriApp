import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

/** Contacto relacionado (responsable / acompañante / remite) almacenado como JSONB */
export interface ContactoRelacionado {
  nombre_completo: string;
  parentesco: string;
  telefono?: string | null;
}

export interface Patient {
  id: string;
  odontologo_id: string;
  /** Columna generada en BD a partir de nombres + apellidos (solo lectura) */
  nombre_completo: string;
  // Identificación estructurada
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_documento: 'CC' | 'TI' | 'CE' | 'PA' | 'RC';
  numero_documento: string;
  fecha_nacimiento: string | null;
  lugar_nacimiento_ciudad: string | null;
  lugar_nacimiento_departamento: string | null;
  sexo: 'M' | 'F' | null;
  estado_civil: string | null;
  // Contacto y ubicación
  telefono: string | null;
  telefono_fijo: string | null;
  email: string | null;
  direccion: string | null;
  barrio: string | null;
  ciudad: string | null;
  departamento: string | null;
  // Afiliación en salud
  eps_id: string | null;
  tipo_vinculacion: string | null;
  afiliacion_salud: string | null;
  // Ocupación
  ocupacion: string | null;
  direccion_laboral: string | null;
  telefono_laboral: string | null;
  // Responsable, acompañante y remite (JSONB)
  responsable: ContactoRelacionado | null;
  acompanante: ContactoRelacionado | null;
  remite: ContactoRelacionado | null;
  // Antecedentes médicos (resumen rápido)
  antecedentes_medicos: string | null;
  alergias: string | null;
  notas_generales: string | null;
  created_at?: string;
  // Computed client-side fields
  ultima_cita?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly auth = inject(AuthService);
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  /** Obtener listado de pacientes con buscador debounced */
  async getPatients(searchQuery?: string): Promise<Patient[]> {
    const user = this.auth.user();
    if (!user) return [];

    this._loading.set(true);
    try {
      let query = supabase
        .from('pacientes')
        .select(`
          *,
          citas (
            fecha_hora
          )
        `)
        .eq('odontologo_id', user.id);

      if (searchQuery && searchQuery.trim() !== '') {
        const cleanSearch = searchQuery.trim();
        query = query.or(
          `nombre_completo.ilike.%${cleanSearch}%,numero_documento.ilike.%${cleanSearch}%,telefono.ilike.%${cleanSearch}%`
        );
      }

      // Ordenar por nombre completo de forma alfabética
      query = query.order('nombre_completo', { ascending: true });
      // Ordenar citas por fecha descendente
      query = query.order('fecha_hora', { foreignTable: 'citas', ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((patient: any) => {
        // Última cita ya ocurrida (las futuras no cuentan); citas viene ordenado desc
        const ahora = new Date();
        const pasada = (patient.citas || []).find((c: { fecha_hora: string }) => new Date(c.fecha_hora) <= ahora);
        const ultimaCita = pasada ? pasada.fecha_hora : null;
        return {
          ...patient,
          ultima_cita: ultimaCita,
        } as Patient;
      });
    } catch (err) {
      console.error('Error fetching patients:', err);
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  /** Obtener un paciente por ID, incluyendo historial completo */
  async getPatientById(id: string): Promise<{
    patient: Patient;
    citas: any[];
    historias: any[];
  } | null> {
    const user = this.auth.user();
    if (!user) return null;

    this._loading.set(true);
    try {
      // 1. Obtener datos del paciente
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .eq('odontologo_id', user.id)
        .single();

      if (patientError) throw patientError;

      // 2. Obtener citas del paciente
      const { data: citasData, error: citasError } = await supabase
        .from('citas')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha_hora', { ascending: false });

      if (citasError) throw citasError;

      // 3. Obtener historias clínicas
      const { data: historiasData, error: historiasError } = await supabase
        .from('historias_clinicas')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha', { ascending: false });

      if (historiasError) throw historiasError;

      return {
        patient: patientData as Patient,
        citas: citasData || [],
        historias: historiasData || [],
      };
    } catch (err) {
      console.error('Error fetching patient details:', err);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /** Crear un nuevo paciente */
  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    this._loading.set(true);
    try {
      // nombre_completo es una columna generada: nunca debe enviarse a la BD
      const { nombre_completo, ...rest } = patient as any;
      const newPatient = {
        ...rest,
        odontologo_id: user.id,
      };

      const { data, error } = await supabase
        .from('pacientes')
        .insert(newPatient)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    } catch (err) {
      console.error('Error creating patient:', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /** Actualizar datos de un paciente */
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    this._loading.set(true);
    try {
      // Eliminar campos calculados/generados para evitar mandarlos a Supabase
      // (ultima_cita es del frontend; nombre_completo es columna generada en BD)
      const { ultima_cita, nombre_completo, ...validUpdates } = updates as any;

      const { data, error } = await supabase
        .from('pacientes')
        .update(validUpdates)
        .eq('id', id)
        .eq('odontologo_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    } catch (err) {
      console.error('Error updating patient:', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  /** Eliminar un paciente */
  async deletePatient(id: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    this._loading.set(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id)
        .eq('odontologo_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting patient:', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }
}
