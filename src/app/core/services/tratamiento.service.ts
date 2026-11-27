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
  cups_codigo?: string | null;
  /** Derivado del embed `catalogo_cups`; no se persiste */
  cups_descripcion?: string | null;
  created_at?: string;
}

export type NuevoTratamiento = Pick<
  Tratamiento,
  'nombre' | 'descripcion' | 'precio_base' | 'duracion_minutos' | 'cups_codigo'
>;

const SELECT = '*, catalogo_cups(descripcion)';

/** Aplana el embed `catalogo_cups` a `cups_descripcion` */
function mapear({ catalogo_cups, ...t }: any): Tratamiento {
  return { ...t, cups_descripcion: catalogo_cups?.descripcion ?? null };
}

@Injectable({ providedIn: 'root' })
export class TratamientoService {
  private readonly auth = inject(AuthService);

  /** Catálogo de tratamientos del odontólogo (activos primero, orden alfabético) */
  async getTratamientos(soloActivos = false): Promise<Tratamiento[]> {
    const user = this.auth.user();
    if (!user) return [];

    let query = supabase
      .from('tratamientos_catalogo')
      .select(SELECT)
      .eq('odontologo_id', user.id)
      .order('nombre', { ascending: true });

    if (soloActivos) query = query.eq('activo', true);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapear);
  }

  async createTratamiento(t: NuevoTratamiento): Promise<Tratamiento> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('tratamientos_catalogo')
      .insert({ ...t, odontologo_id: user.id })
      .select(SELECT)
      .single();

    if (error) throw error;
    return mapear(data);
  }

  async updateTratamiento(id: string, cambios: Partial<NuevoTratamiento> & { activo?: boolean }): Promise<Tratamiento> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('tratamientos_catalogo')
      .update(cambios)
      .eq('id', id)
      .eq('odontologo_id', user.id)
      .select(SELECT)
      .single();

    if (error) throw error;
    return mapear(data);
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
