import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { EPS_BASE } from './eps-base';

export type RegimenEps = 'contributivo' | 'subsidiado' | 'especial';

export interface Eps {
  id: string;
  nombre: string;
  regimen: RegimenEps;
  activa: boolean;
  created_at?: string;
}

/**
 * Catálogo global de EPS de Colombia.
 * El catálogo es compartido: todos los odontólogos ven las mismas EPS.
 * Solo el super_admin puede agregar, editar o desactivar EPS.
 */
@Injectable({ providedIn: 'root' })
export class EpsService {
  private cacheActivas: Eps[] | null = null;
  private cacheAll: Eps[] | null = null;

  /** EPS activas para el selector del formulario de paciente (cacheadas) */
  async getEps(): Promise<Eps[]> {
    if (this.cacheActivas) return this.cacheActivas;
    const { data, error } = await supabase
      .from('catalogo_eps')
      .select('*')
      .eq('activa', true)
      .order('regimen', { ascending: true })
      .order('nombre', { ascending: true });
    if (error) throw error;
    this.cacheActivas = (data ?? []) as Eps[];
    return this.cacheActivas;
  }

  /** Todas las EPS (activas e inactivas) para la pantalla de gestión */
  async getAllEps(): Promise<Eps[]> {
    if (this.cacheAll) return this.cacheAll;
    const { data, error } = await supabase
      .from('catalogo_eps')
      .select('*')
      .order('regimen', { ascending: true })
      .order('nombre', { ascending: true });
    if (error) throw error;
    this.cacheAll = (data ?? []) as Eps[];
    return this.cacheAll;
  }

  /**
   * Agrega una EPS al catálogo global.
   * Solo permitido para super_admin (controlado por RLS en la BD).
   */
  async addEps(nombre: string, regimen: RegimenEps): Promise<Eps> {
    const { data, error } = await supabase
      .from('catalogo_eps')
      .insert({ nombre: nombre.trim(), regimen })
      .select()
      .single();
    if (error) throw error;
    this.invalidarCache();
    return data as Eps;
  }

  /**
   * Activa o desactiva una EPS del catálogo global.
   * Solo permitido para super_admin (controlado por RLS en la BD).
   */
  async setActiva(id: string, activa: boolean): Promise<void> {
    const { error } = await supabase
      .from('catalogo_eps')
      .update({ activa })
      .eq('id', id);
    if (error) throw error;
    this.invalidarCache();
  }

  /**
   * Siembra el set base de EPS (`EPS_BASE`) en el catálogo global, omitiendo las
   * que ya existen por nombre. Devuelve cuántas EPS nuevas se insertaron.
   * Solo permitido para super_admin (controlado por RLS en la BD).
   */
  async seedComunes(): Promise<number> {
    const existentes = await this.getAllEps();
    const presentes = new Set(existentes.map((e) => e.nombre.trim().toUpperCase()));
    const faltantes = EPS_BASE.filter((e) => !presentes.has(e.nombre.toUpperCase()));
    if (faltantes.length === 0) return 0;
    const { error } = await supabase.from('catalogo_eps').insert(faltantes);
    if (error) throw error;
    this.invalidarCache();
    return faltantes.length;
  }

  /** Invalida ambos cachés para forzar recarga en la siguiente consulta */
  invalidarCache(): void {
    this.cacheActivas = null;
    this.cacheAll = null;
  }
}
