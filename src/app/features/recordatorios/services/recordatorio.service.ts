import { inject, Injectable } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { AuthService } from '../../../core/services/auth.service';
import { Cita, CitaService } from '../../../core/services/cita.service';
import { agruparPorDia, DiaRecordatorios } from '../funciones/agrupar-por-dia.funcion';

const ESTADOS_EXCLUIDOS: Cita['estado'][] = ['cancelada', 'no_asistio', 'atendida'];

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private readonly auth = inject(AuthService);
  private readonly citaService = inject(CitaService);

  /** Citas activas de los próximos `dias` días, agrupadas por día con su estado de envío. */
  async getRecordatoriosRango(desde: Date, dias = 7): Promise<DiaRecordatorios[]> {
    const user = this.auth.user();
    if (!user) return [];
    const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    const fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + dias);
    const citas = (await this.citaService.getCitas(inicio.toISOString(), fin.toISOString())).filter(
      (c) => !ESTADOS_EXCLUIDOS.includes(c.estado),
    );
    const ids = citas.map((c) => c.id).filter((id): id is string => !!id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('mensajes_enviados')
      .select('cita_id, created_at')
      .eq('odontologo_id', user.id)
      .eq('tipo_plantilla', 'recordatorio')
      .in('cita_id', ids);
    if (error) throw error;

    const ultimos = new Map<string, string>();
    for (const r of data ?? []) {
      const previo = ultimos.get(r.cita_id as string);
      if (!previo || r.created_at > previo) ultimos.set(r.cita_id as string, r.created_at as string);
    }
    return agruparPorDia(citas, ultimos);
  }
}
