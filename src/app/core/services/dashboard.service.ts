import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { Cita } from './cita.service';

export interface DashboardData {
  citasHoy: Cita[];
  proximas7: number;
  pacientesNuevosMes: number;
  saldoPendiente: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly auth = inject(AuthService);

  /** Métricas del dashboard, consultadas en paralelo (count/sum agregados) */
  async getResumen(): Promise<DashboardData> {
    const user = this.auth.user();
    if (!user) return { citasHoy: [], proximas7: 0, pacientesNuevosMes: 0, saldoPendiente: 0 };

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const in7 = new Date(todayEnd);
    in7.setDate(in7.getDate() + 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [citasHoy, proximas7, pacientesNuevosMes, presupuestos, pagos] = await Promise.all([
      supabase
        .from('citas')
        .select('*, paciente:pacientes(nombre_completo, telefono)')
        .eq('odontologo_id', user.id)
        .gte('fecha_hora', todayStart.toISOString())
        .lte('fecha_hora', todayEnd.toISOString())
        .order('fecha_hora', { ascending: true }),
      supabase
        .from('citas')
        .select('id', { count: 'exact', head: true })
        .eq('odontologo_id', user.id)
        .gt('fecha_hora', todayEnd.toISOString())
        .lte('fecha_hora', in7.toISOString())
        .neq('estado', 'cancelada'),
      supabase
        .from('pacientes')
        .select('id', { count: 'exact', head: true })
        .eq('odontologo_id', user.id)
        .gte('created_at', monthStart.toISOString()),
      supabase
        .from('presupuestos')
        .select('total')
        .eq('odontologo_id', user.id)
        .eq('estado', 'aceptado'),
      supabase.from('pagos').select('monto').eq('odontologo_id', user.id),
    ]);

    const facturado = (presupuestos.data ?? []).reduce((s, p: any) => s + (p.total ?? 0), 0);
    const pagado = (pagos.data ?? []).reduce((s, p: any) => s + (p.monto ?? 0), 0);

    return {
      citasHoy: (citasHoy.data ?? []) as Cita[],
      proximas7: proximas7.count ?? 0,
      pacientesNuevosMes: pacientesNuevosMes.count ?? 0,
      saldoPendiente: Math.max(0, facturado - pagado),
    };
  }
}
