import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export type TipoPlantilla = 'confirmacion' | 'recordatorio' | 'bienvenida' | 'personalizado';

export interface Plantilla {
  id: string;
  odontologo_id: string;
  tipo: TipoPlantilla;
  texto: string;
  created_at?: string;
}

/** Tipos base que todo odontólogo debe tener al entrar por primera vez */
export const TIPOS_BASE: readonly TipoPlantilla[] = ['confirmacion', 'recordatorio', 'bienvenida'] as const;

/** Textos por defecto en español de Colombia, cálidos y profesionales */
export const PLANTILLAS_DEFECTO: Record<'confirmacion' | 'recordatorio' | 'bienvenida', string> = {
  confirmacion:
    '¡Hola {nombre}! 😊 Tu cita en {consultorio} quedó confirmada para el {fecha} a las {hora}. ¡Te esperamos con gusto!',
  recordatorio:
    '¡Hola {nombre}! Te recordamos tu cita en {consultorio} el {fecha} a las {hora}. Si necesitas reagendar, escríbenos por este mismo chat.',
  bienvenida:
    '¡Hola {nombre}! 👋 Te damos la bienvenida a {consultorio}. Gracias por confiar en nosotros para el cuidado de tu sonrisa. Si tienes cualquier duda, escríbenos por este chat.',
};

@Injectable({ providedIn: 'root' })
export class PlantillaService {
  private readonly auth = inject(AuthService);
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  /** Obtiene las plantillas del odontólogo autenticado */
  async getPlantillas(): Promise<Plantilla[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('plantillas_mensajes')
      .select('*')
      .eq('odontologo_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Plantilla[];
  }

  /**
   * Devuelve las plantillas del odontólogo, creando automáticamente las 3
   * plantillas base con textos por defecto si aún no existen.
   */
  async loadOrSeed(): Promise<Plantilla[]> {
    const user = this.auth.user();
    if (!user) return [];

    this._loading.set(true);
    try {
      const existentes = await this.getPlantillas();
      const tiposExistentes = new Set(existentes.map((p) => p.tipo));

      // Detectar qué tipos base faltan y crearlos
      const faltantes = TIPOS_BASE.filter((tipo) => !tiposExistentes.has(tipo));

      if (faltantes.length > 0) {
        const nuevas = faltantes.map((tipo) => ({
          odontologo_id: user.id,
          tipo,
          texto: PLANTILLAS_DEFECTO[tipo as keyof typeof PLANTILLAS_DEFECTO],
        }));

        const { data, error } = await supabase
          .from('plantillas_mensajes')
          .insert(nuevas)
          .select();

        if (error) throw error;
        return [...existentes, ...((data ?? []) as Plantilla[])];
      }

      return existentes;
    } finally {
      this._loading.set(false);
    }
  }

  /** Actualiza el texto de una plantilla */
  async updatePlantilla(id: string, texto: string): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { error } = await supabase
      .from('plantillas_mensajes')
      .update({ texto })
      .eq('id', id)
      .eq('odontologo_id', user.id);

    if (error) throw error;
  }
}
