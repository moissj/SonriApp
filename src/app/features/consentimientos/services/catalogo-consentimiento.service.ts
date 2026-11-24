import { Injectable } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { CatalogoConsentimiento } from '../models/consentimiento.model';

@Injectable({ providedIn: 'root' })
export class CatalogoConsentimientoService {
  async listarActivos(): Promise<CatalogoConsentimiento[]> {
    const { data, error } = await supabase
      .from('catalogo_consentimientos')
      .select('id, tipo, titulo, cuerpo, version, activo')
      .eq('activo', true)
      .order('titulo');
    if (error) throw error;
    return data ?? [];
  }

  async listarTodos(): Promise<CatalogoConsentimiento[]> {
    const { data, error } = await supabase
      .from('catalogo_consentimientos')
      .select('id, tipo, titulo, cuerpo, version, activo')
      .order('titulo');
    if (error) throw error;
    return data ?? [];
  }

  async crear(d: { tipo: string; titulo: string; cuerpo: string }): Promise<void> {
    const { error } = await supabase
      .from('catalogo_consentimientos')
      .insert({ ...d, version: 1, activo: true });
    if (error) throw error;
  }

  // shortcut: read-then-update no es atómico; aceptable con un único super_admin editando.
  async editar(id: string, d: { titulo: string; cuerpo: string }): Promise<void> {
    const { data, error: errLectura } = await supabase
      .from('catalogo_consentimientos')
      .select('version')
      .eq('id', id)
      .single();
    if (errLectura) throw errLectura;
    const { error } = await supabase
      .from('catalogo_consentimientos')
      .update({ ...d, version: data.version + 1 })
      .eq('id', id);
    if (error) throw error;
  }

  async activar(id: string, activo: boolean): Promise<void> {
    const { error } = await supabase.from('catalogo_consentimientos').update({ activo }).eq('id', id);
    if (error) throw error;
  }
}
