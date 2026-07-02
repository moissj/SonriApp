import { Injectable, inject } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';

export interface Pago {
  id: string;
  odontologo_id: string;
  paciente_id: string;
  presupuesto_id: string | null;
  cita_id: string | null;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  created_at: string;
}

export interface NuevoPago {
  monto: number;
  metodo: MetodoPago;
  presupuesto_id?: string | null;
  cita_id?: string | null;
}

export interface ResumenFacturacion {
  facturado: number;
  pagado: number;
  saldo: number;
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly auth = inject(AuthService);

  /** Pagos de un paciente, más recientes primero */
  async getPagos(pacienteId: string): Promise<Pago[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Pago[];
  }

  /** Registra un pago */
  async createPago(pacienteId: string, p: NuevoPago): Promise<Pago> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { data, error } = await supabase
      .from('pagos')
      .insert({
        odontologo_id: user.id,
        paciente_id: pacienteId,
        presupuesto_id: p.presupuesto_id ?? null,
        cita_id: p.cita_id ?? null,
        monto: p.monto,
        metodo: p.metodo,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Pago;
  }

  /**
   * Resumen de facturación del paciente:
   * - facturado: suma de totales de presupuestos aceptados
   * - pagado: suma de todos los pagos
   * - saldo: facturado - pagado
   */
  async getResumen(pacienteId: string): Promise<ResumenFacturacion> {
    const user = this.auth.user();
    if (!user) return { facturado: 0, pagado: 0, saldo: 0 };

    const [{ data: presupuestos, error: e1 }, { data: pagos, error: e2 }] = await Promise.all([
      supabase
        .from('presupuestos')
        .select('total')
        .eq('odontologo_id', user.id)
        .eq('paciente_id', pacienteId)
        .eq('estado', 'aceptado'),
      supabase
        .from('pagos')
        .select('monto')
        .eq('odontologo_id', user.id)
        .eq('paciente_id', pacienteId),
    ]);

    if (e1) throw e1;
    if (e2) throw e2;

    const facturado = (presupuestos ?? []).reduce((sum, p: any) => sum + (p.total ?? 0), 0);
    const pagado = (pagos ?? []).reduce((sum, p: any) => sum + (p.monto ?? 0), 0);
    return { facturado, pagado, saldo: facturado - pagado };
  }
}
