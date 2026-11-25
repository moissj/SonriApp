import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { Cita } from './cita.service';
import { hoyBogota } from '../funciones/fecha-bogota.funcion';

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

    // Límites del día en America/Bogota (UTC-5 fijo, sin DST).
    const dia = hoyBogota();
    const todayStart = new Date(`${dia}T00:00:00-05:00`);
    const todayEnd = new Date(`${dia}T23:59:59.999-05:00`);
    const in7 = new Date(todayEnd.getTime() + 7 * 24 * 3600 * 1000);
    const monthStart = new Date(`${dia.slice(0, 7)}-01T00:00:00-05:00`);

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
