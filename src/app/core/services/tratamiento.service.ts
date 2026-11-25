import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface Tratamiento {
  id: string;
  odontologo_id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  duracion_minutos: number;
  activo: boolean;
  created_at?: string;
}

export type NuevoTratamiento = Pick<
  Tratamiento,
  'nombre' | 'descripcion' | 'precio_base' | 'duracion_minutos'
>;

@Injectable({ providedIn: 'root' })
export class TratamientoService {
  private readonly auth = inject(AuthService);

  /** Catálogo de tratamientos del odontólogo (activos primero, orden alfabético) */
  async getTratamientos(soloActivos = false): Promise<Tratamiento[]> {
    const user = this.auth.user();
    if (!user) return [];

    let query = supabase
      .from('tratamientos_catalogo')
      .select('*')
      .eq('odontologo_id', user.id)
      .order('nombre', { ascending: true });

    if (soloActivos) query = query.eq('activo', true);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Tratamiento[];
  }

  async createTratamiento(t: NuevoTratamiento): Promise<Tratamiento> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('tratamientos_catalogo')
      .insert({ ...t, odontologo_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Tratamiento;
  }

  async updateTratamiento(id: string, cambios: Partial<NuevoTratamiento> & { activo?: boolean }): Promise<Tratamiento> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('tratamientos_catalogo')
      .update(cambios)
      .eq('id', id)
      .eq('odontologo_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Tratamiento;
  }

  async deleteTratamiento(id: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { error } = await supabase
      .from('tratamientos_catalogo')
      .delete()
      .eq('id', id)
      .eq('odontologo_id', user.id);

    if (error) throw error;
  }
}
