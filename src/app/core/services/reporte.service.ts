import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface CitasPorEstado {
  estado: string;
  count: number;
}

export interface PacienteInactivo {
  id: string;
  nombre_completo: string;
  telefono: string | null;
  ultima_cita: string | null;
}

export interface ReporteMensual {
  citasPorEstado: CitasPorEstado[];
  facturadoMes: number;
  cobradoMes: number;
  pacientesInactivos: PacienteInactivo[];
}

const ESTADOS = ['pendiente', 'confirmada', 'atendida', 'cancelada', 'no_asistio'];

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly auth = inject(AuthService);

  async getReporteMensual(): Promise<ReporteMensual> {
    const user = this.auth.user();
    if (!user) {
      return { citasPorEstado: [], facturadoMes: 0, cobradoMes: 0, pacientesInactivos: [] };
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const cutoff60 = new Date(now);
    cutoff60.setDate(cutoff60.getDate() - 60);

    const [citasMes, presupuestos, pagos, pacientes, citasTodas] = await Promise.all([
      supabase
        .from('citas')
        .select('estado')
        .eq('odontologo_id', user.id)
        .gte('fecha_hora', monthStart.toISOString())
        .lte('fecha_hora', monthEnd.toISOString()),
      supabase
        .from('presupuestos')
        .select('total')
        .eq('odontologo_id', user.id)
        .eq('estado', 'aceptado')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString()),
      supabase
        .from('pagos')
        .select('monto')
        .eq('odontologo_id', user.id)
        .gte('fecha', monthStart.toISOString().split('T')[0])
        .lte('fecha', monthEnd.toISOString().split('T')[0]),
      supabase
        .from('pacientes')
        .select('id, nombre_completo, telefono')
        .eq('odontologo_id', user.id),
      supabase.from('citas').select('paciente_id, fecha_hora').eq('odontologo_id', user.id),
    ]);

    // Citas por estado (incluye estados con cero)
    const conteo: Record<string, number> = {};
    for (const e of ESTADOS) conteo[e] = 0;
    for (const c of (citasMes.data ?? []) as any[]) {
      if (conteo[c.estado] !== undefined) conteo[c.estado]++;
    }
    const citasPorEstado = ESTADOS.map((estado) => ({ estado, count: conteo[estado] }));

    const facturadoMes = (presupuestos.data ?? []).reduce((s, p: any) => s + (p.total ?? 0), 0);
    const cobradoMes = (pagos.data ?? []).reduce((s, p: any) => s + (p.monto ?? 0), 0);

    // Última cita por paciente
    const ultimaPorPaciente: Record<string, string> = {};
    for (const c of (citasTodas.data ?? []) as any[]) {
      const prev = ultimaPorPaciente[c.paciente_id];
      if (!prev || c.fecha_hora > prev) ultimaPorPaciente[c.paciente_id] = c.fecha_hora;
    }

    const cutoffISO = cutoff60.toISOString();
    const pacientesInactivos: PacienteInactivo[] = ((pacientes.data ?? []) as any[])
      .map((p) => ({
        id: p.id,
        nombre_completo: p.nombre_completo,
        telefono: p.telefono,
        ultima_cita: ultimaPorPaciente[p.id] ?? null,
      }))
      .filter((p) => !p.ultima_cita || p.ultima_cita < cutoffISO)
      .sort((a, b) => (a.ultima_cita ?? '').localeCompare(b.ultima_cita ?? ''));

    return { citasPorEstado, facturadoMes, cobradoMes, pacientesInactivos };
  }
}
