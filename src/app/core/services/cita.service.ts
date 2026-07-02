import { inject, Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface Cita {
  id?: string;
  odontologo_id?: string;
  paciente_id: string;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_tratamiento: string;
  estado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'no_asistio';
  notas?: string;
  canal_origen: 'manual' | 'whatsapp' | 'portal';
  paciente?: {
    nombre_completo: string;
    telefono: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly auth = inject(AuthService);

  async getCitas(startDate: string, endDate: string): Promise<Cita[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('citas')
      .select('*, paciente:pacientes(nombre_completo, telefono)')
      .eq('odontologo_id', user.id)
      .gte('fecha_hora', startDate)
      .lte('fecha_hora', endDate)
      .order('fecha_hora', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    return data || [];
  }

  async saveCita(cita: Cita): Promise<Cita> {
    const user = this.auth.user();
    if (!user) throw new Error('User not authenticated');

    // Quitar campos relacionales antes de guardar
    const { paciente, ...pureCita } = cita;
    const citaData = {
      ...pureCita,
      odontologo_id: user.id,
    };

    const { data, error } = await supabase
      .from('citas')
      .upsert(citaData)
      .select();

    if (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
    return data && data.length > 0 ? data[0] : (citaData as any);
  }

  async deleteCita(id: string): Promise<void> {
    const { error } = await supabase.from('citas').delete().eq('id', id);
    if (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async checkOverlap(fechaHora: string, duracionMinutos: number, excluyendoCitaId?: string): Promise<Cita[]> {
    const checkStart = new Date(fechaHora).getTime();
    const checkEnd = checkStart + duracionMinutos * 60000;

    const startOfDay = new Date(fechaHora);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaHora);
    endOfDay.setHours(23, 59, 59, 999);

    const list = await this.getCitas(startOfDay.toISOString(), endOfDay.toISOString());
    return list.filter((cita) => {
      if (excluyendoCitaId && cita.id === excluyendoCitaId) return false;
      if (cita.estado === 'cancelada') return false;

      const citaStart = new Date(cita.fecha_hora).getTime();
      const citaEnd = citaStart + cita.duracion_minutos * 60000;

      return checkStart < citaEnd && checkEnd > citaStart;
    });
  }
}
