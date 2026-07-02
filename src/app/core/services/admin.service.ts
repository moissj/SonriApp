import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface CuentaOdontologo {
  id: string;
  nombre_completo: string;
  nombre_consultorio: string | null;
  email: string | null;
  plan_contratado: string | null;
  estado_cuenta: 'activo' | 'suspendido' | 'vencido';
  fecha_vencimiento_plan: string | null;
}

export interface NuevaCuenta {
  nombre_completo: string;
  email: string;
  nombre_consultorio: string;
  plan_contratado: string;
  fecha_vencimiento_plan: string;
}

export interface AdminStats {
  activas: number;
  suspendidas: number;
  porVencer30: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  /** Lista de cuentas de odontólogos (con buscador por nombre o correo) */
  async getCuentas(search?: string): Promise<CuentaOdontologo[]> {
    let query = supabase
      .from('profiles')
      .select('id, nombre_completo, nombre_consultorio, email, plan_contratado, estado_cuenta, fecha_vencimiento_plan')
      .eq('rol', 'odontologo')
      .order('nombre_completo', { ascending: true });

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`nombre_completo.ilike.%${s}%,email.ilike.%${s}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as CuentaOdontologo[];
  }

  /** Contadores para el dashboard del admin */
  async getStats(): Promise<AdminStats> {
    const hoy = new Date();
    const en30 = new Date(hoy);
    en30.setDate(en30.getDate() + 30);
    const hoyStr = hoy.toISOString().split('T')[0];
    const en30Str = en30.toISOString().split('T')[0];

    const [activas, suspendidas, porVencer] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('rol', 'odontologo').eq('estado_cuenta', 'activo'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('rol', 'odontologo').eq('estado_cuenta', 'suspendido'),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('rol', 'odontologo')
        .eq('estado_cuenta', 'activo')
        .gte('fecha_vencimiento_plan', hoyStr)
        .lte('fecha_vencimiento_plan', en30Str),
    ]);

    return {
      activas: activas.count ?? 0,
      suspendidas: suspendidas.count ?? 0,
      porVencer30: porVencer.count ?? 0,
    };
  }

  /** Cambia el estado de una cuenta */
  async setEstado(id: string, estado: 'activo' | 'suspendido' | 'vencido'): Promise<void> {
    const { error } = await supabase.from('profiles').update({ estado_cuenta: estado }).eq('id', id);
    if (error) throw error;
  }

  /** Actualiza plan y fecha de vencimiento */
  async setPlan(id: string, plan: string, fecha: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ plan_contratado: plan, fecha_vencimiento_plan: fecha })
      .eq('id', id);
    if (error) throw error;
  }

  /** Elimina la fila de perfil (la baja del usuario en auth requiere Edge Function) */
  async eliminarCuenta(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Crea una cuenta de odontólogo invocando la Edge Function segura.
   * El cliente NUNCA crea el usuario directamente.
   */
  async crearCuenta(payload: NuevaCuenta): Promise<CuentaOdontologo> {
    const { data, error } = await supabase.functions.invoke('crear-cuenta-odontologo', {
      body: payload,
    });
    if (error) {
      // La función devuelve el mensaje de error en el cuerpo cuando aplica
      const msg = (data as any)?.error || error.message || 'No se pudo crear la cuenta.';
      throw new Error(msg);
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return (data as any).cuenta as CuentaOdontologo;
  }
}
