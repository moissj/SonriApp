import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  departamento_id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private departamentosCache: Departamento[] | null = null;

  /** Lista de departamentos (cacheada) */
  async getDepartamentos(): Promise<Departamento[]> {
    if (this.departamentosCache) return this.departamentosCache;
    const { data, error } = await supabase
      .from('departamentos')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    if (error) throw error;
    this.departamentosCache = (data ?? []) as Departamento[];
    return this.departamentosCache;
  }

  /** Municipios de un departamento (por id) */
  async getMunicipios(departamentoId: number): Promise<Municipio[]> {
    const { data, error } = await supabase
      .from('municipios')
      .select('id, departamento_id, nombre')
      .eq('departamento_id', departamentoId)
      .order('nombre', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Municipio[];
  }
}
