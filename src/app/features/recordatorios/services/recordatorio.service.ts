import { inject, Injectable } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { AuthService } from '../../../core/services/auth.service';
import { Cita, CitaService } from '../../../core/services/cita.service';
import { filtrarPendientes } from '../funciones/pendientes.funcion';
import { ventanaManana } from '../funciones/ventana-manana.funcion';

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private readonly auth = inject(AuthService);
  private readonly citaService = inject(CitaService);

  /** Citas de mañana sin recordatorio WhatsApp registrado. */
  async getPendientes(): Promise<Cita[]> {
    const user = this.auth.user();
    if (!user) return [];
    const { inicio, fin } = ventanaManana(new Date());
    const citas = await this.citaService.getCitas(inicio, fin);
    const ids = citas.map((c) => c.id).filter((id): id is string => !!id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('mensajes_enviados')
      .select('cita_id')
      .eq('odontologo_id', user.id)
      .eq('tipo_plantilla', 'recordatorio')
      .in('cita_id', ids);
    if (error) throw error;

    const enviados = new Set((data ?? []).map((r) => r.cita_id as string));
    return filtrarPendientes(citas, enviados);
  }
}
