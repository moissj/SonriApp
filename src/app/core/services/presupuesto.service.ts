import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export type EstadoPresupuesto = 'pendiente' | 'aceptado' | 'rechazado';
export type DescuentoTipo = 'ninguno' | 'porcentaje' | 'monto';

export interface PresupuestoItem {
  id?: string;
  presupuesto_id?: string;
  tratamiento_id: string | null;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Presupuesto {
  id: string;
  odontologo_id: string;
  paciente_id: string;
  estado: EstadoPresupuesto;
  subtotal: number;
  descuento_tipo: DescuentoTipo;
  descuento_valor: number;
  total: number;
  notas: string | null;
  created_at: string;
  items?: PresupuestoItem[];
}

export interface NuevoPresupuesto {
  subtotal: number;
  descuento_tipo: DescuentoTipo;
  descuento_valor: number;
  total: number;
  notas: string | null;
  items: PresupuestoItem[];
}

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  private readonly auth = inject(AuthService);

  /** Presupuestos de un paciente con sus líneas, más recientes primero */
  async getPresupuestos(pacienteId: string): Promise<Presupuesto[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('presupuestos')
      .select('*, items:presupuesto_items(*)')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Presupuesto[];
  }

  /** Crea un presupuesto con sus líneas */
  async createPresupuesto(pacienteId: string, p: NuevoPresupuesto): Promise<Presupuesto> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data: presupuesto, error } = await supabase
      .from('presupuestos')
      .insert({
        odontologo_id: user.id,
        paciente_id: pacienteId,
        estado: 'pendiente',
        subtotal: p.subtotal,
        descuento_tipo: p.descuento_tipo,
        descuento_valor: p.descuento_valor,
        total: p.total,
        notas: p.notas,
      })
      .select()
      .single();

    if (error) throw error;

    const items = p.items.map((it) => ({
      presupuesto_id: presupuesto.id,
      tratamiento_id: it.tratamiento_id,
      nombre: it.nombre,
      precio: it.precio,
      cantidad: it.cantidad,
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from('presupuesto_items')
      .insert(items)
      .select();

    if (itemsError) throw itemsError;

    return { ...(presupuesto as Presupuesto), items: (itemsData ?? []) as PresupuestoItem[] };
  }

  /** Cambia el estado de un presupuesto */
  async updateEstado(id: string, estado: EstadoPresupuesto): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { error } = await supabase
      .from('presupuestos')
      .update({ estado })
      .eq('id', id)
      .eq('odontologo_id', user.id);

    if (error) throw error;
  }

  /** Actualiza un presupuesto y reemplaza sus líneas */
  async updatePresupuesto(id: string, p: NuevoPresupuesto): Promise<Presupuesto> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data: presupuesto, error } = await supabase
      .from('presupuestos')
      .update({
        subtotal: p.subtotal,
        descuento_tipo: p.descuento_tipo,
        descuento_valor: p.descuento_valor,
        total: p.total,
        notas: p.notas,
      })
      .eq('id', id)
      .eq('odontologo_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Reemplazar líneas: borrar las actuales e insertar las nuevas
    const { error: delErr } = await supabase.from('presupuesto_items').delete().eq('presupuesto_id', id);
    if (delErr) throw delErr;

    const items = p.items.map((it) => ({
      presupuesto_id: id,
      tratamiento_id: it.tratamiento_id,
      nombre: it.nombre,
      precio: it.precio,
      cantidad: it.cantidad,
    }));
    const { data: itemsData, error: itemsError } = await supabase
      .from('presupuesto_items')
      .insert(items)
      .select();
    if (itemsError) throw itemsError;

    return { ...(presupuesto as Presupuesto), items: (itemsData ?? []) as PresupuestoItem[] };
  }

  /** Número de pagos asociados a un presupuesto */
  async contarPagos(presupuestoId: string): Promise<number> {
    const user = this.auth.user();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('pagos')
      .select('id', { count: 'exact', head: true })
      .eq('odontologo_id', user.id)
      .eq('presupuesto_id', presupuestoId);

    if (error) throw error;
    return count ?? 0;
  }

  async deletePresupuesto(id: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { error } = await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
      .eq('odontologo_id', user.id);

    if (error) throw error;
  }
}
