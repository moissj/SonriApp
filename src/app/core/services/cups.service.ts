import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface Cups {
  codigo: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class CupsService {
  async buscar(q: string, limit = 20): Promise<Cups[]> {
    // Quita caracteres que rompen la sintaxis del filtro .or() de PostgREST.
    const termino = q.trim().replace(/[,()%*]/g, ' ').trim();
    if (!termino) return [];
    const { data, error } = await supabase
      .from('catalogo_cups')
      .select('codigo, descripcion')
      .eq('activo', true)
      .or(`codigo.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }
}
