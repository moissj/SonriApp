import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { PlantillaService, TipoPlantilla } from './plantilla.service';

/** Datos disponibles para reemplazar los placeholders de una plantilla */
export interface PlantillaContext {
  nombre?: string;
  fecha?: string;
  hora?: string;
  consultorio?: string;
}

/** Paciente mínimo requerido para enviar un mensaje */
export interface PacienteMensaje {
  id: string;
  nombre_completo: string;
  telefono: string | null;
}

/** Cita mínima opcional (para plantillas con fecha/hora) */
export interface CitaMensaje {
  id?: string;
  fecha_hora?: string;
}

export interface EnviarOpts {
  paciente: PacienteMensaje;
  tipo: TipoPlantilla;
  cita?: CitaMensaje | null;
}

/** Registro de un mensaje enviado (tabla mensajes_enviados) */
export interface MensajeEnviado {
  id: string;
  paciente_id: string;
  cita_id: string | null;
  canal: string;
  tipo_plantilla: TipoPlantilla | null;
  texto_enviado: string;
  created_at: string;
}

/**
 * Servicio único para la comunicación por WhatsApp (click-to-chat).
 * Centraliza el render de plantillas, la normalización del número, la
 * generación de la URL wa.me y el registro en `mensajes_enviados`.
 * Ninguna otra parte de la app debe construir URLs de WhatsApp por su cuenta.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly plantillaService = inject(PlantillaService);

  /** Textos de plantillas cacheados por tipo, para envíos sin bloqueo */
  private readonly plantillas = signal<Record<string, string>>({});

  /**
   * Precarga (y crea si es necesario) las plantillas del odontólogo.
   * Debe llamarse al iniciar las vistas que envían mensajes, para que
   * `enviar()` pueda ejecutar `window.open` dentro del gesto del usuario.
   */
  async preloadPlantillas(): Promise<void> {
    try {
      const lista = await this.plantillaService.loadOrSeed();
      const map: Record<string, string> = {};
      for (const p of lista) map[p.tipo] = p.texto;
      this.plantillas.set(map);
    } catch (err) {
      console.error('No se pudieron precargar las plantillas:', err);
    }
  }

  /**
   * Envía un mensaje por WhatsApp a un paciente usando la plantilla indicada:
   * renderiza el texto, abre wa.me en una nueva pestaña y registra el envío.
   * Devuelve `false` si el paciente no tiene teléfono. La promesa se resuelve
   * cuando el registro en `mensajes_enviados` ha terminado.
   */
  async enviar(opts: EnviarOpts): Promise<boolean> {
    const { paciente, tipo, cita } = opts;
    if (!paciente.telefono) return false;

    const profile = this.profileService.profile();
    const texto = this.render(this.plantillas()[tipo] ?? '', {
      nombre: this.primerNombre(paciente.nombre_completo),
      fecha: cita?.fecha_hora ? this.formatFecha(cita.fecha_hora) : '',
      hora: cita?.fecha_hora ? this.formatHora(cita.fecha_hora) : '',
      consultorio: profile?.nombre_consultorio ?? profile?.nombre_completo ?? 'nuestro consultorio',
    });

    // Abrir WhatsApp de inmediato (dentro del gesto del usuario, antes de cualquier await)
    // evita que el navegador bloquee la ventana emergente.
    window.open(this.buildUrl(paciente.telefono, texto), '_blank', 'noopener');

    await this.registrarEnvio({
      paciente_id: paciente.id,
      cita_id: cita?.id ?? null,
      tipo,
      texto_enviado: texto,
    });

    return true;
  }

  /**
   * Reemplaza los placeholders {nombre}, {fecha}, {hora} y {consultorio}
   * por los valores del contexto. Los placeholders sin valor se eliminan
   * y se limpian los espacios sobrantes.
   */
  render(texto: string, ctx: PlantillaContext): string {
    const valores: Record<string, string> = {
      nombre: ctx.nombre ?? '',
      fecha: ctx.fecha ?? '',
      hora: ctx.hora ?? '',
      consultorio: ctx.consultorio ?? '',
    };

    return texto
      .replace(/\{(nombre|fecha|hora|consultorio)\}/g, (_, key) => valores[key] ?? '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  /** Extrae el primer nombre de un nombre completo (más cálido en el saludo) */
  primerNombre(nombreCompleto: string | undefined | null): string {
    return (nombreCompleto ?? '').trim().split(/\s+/)[0] ?? '';
  }

  /** Formatea una fecha ISO como "martes, 8 de julio" en español de Colombia */
  formatFecha(fechaISO: string): string {
    return new Date(fechaISO).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  /** Formatea una hora ISO como "10:00 a. m." */
  formatHora(fechaISO: string): string {
    return new Date(fechaISO).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Construye el enlace wa.me con el mensaje. Deja solo dígitos y antepone
   * el código de país colombiano (57) si el número tiene 10 dígitos.
   */
  buildUrl(telefono: string | null | undefined, texto: string): string {
    const digits = (telefono ?? '').replace(/\D/g, '');
    const withCountry = digits.length === 10 ? `57${digits}` : digits;
    return `https://wa.me/${withCountry}?text=${encodeURIComponent(texto)}`;
  }

  /** Registra el envío en la tabla mensajes_enviados (no bloquea la UI) */
  async registrarEnvio(registro: {
    paciente_id: string;
    cita_id?: string | null;
    tipo?: TipoPlantilla | null;
    texto_enviado: string;
  }): Promise<void> {
    const user = this.auth.user();
    if (!user) return;

    const { error } = await supabase.from('mensajes_enviados').insert({
      odontologo_id: user.id,
      paciente_id: registro.paciente_id,
      cita_id: registro.cita_id ?? null,
      tipo_plantilla: registro.tipo ?? null,
      canal: 'whatsapp_link',
      texto_enviado: registro.texto_enviado,
    });

    if (error) {
      // El registro es secundario: no interrumpimos el flujo de envío
      console.error('No se pudo registrar el mensaje enviado:', error);
    }
  }

  /**
   * Envía un texto libre por WhatsApp (p. ej. resumen de presupuesto),
   * reutilizando la generación de URL y el registro del propio servicio.
   * No es un mecanismo distinto: usa `buildUrl` + `registrarEnvio`.
   */
  enviarTexto(
    paciente: PacienteMensaje,
    texto: string,
    ref?: { cita_id?: string | null }
  ): boolean {
    if (!paciente.telefono) return false;
    window.open(this.buildUrl(paciente.telefono, texto), '_blank', 'noopener');
    void this.registrarEnvio({
      paciente_id: paciente.id,
      cita_id: ref?.cita_id ?? null,
      tipo: null,
      texto_enviado: texto,
    });
    return true;
  }
  async getHistorial(pacienteId: string): Promise<MensajeEnviado[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data, error } = await supabase
      .from('mensajes_enviados')
      .select('*')
      .eq('odontologo_id', user.id)
      .eq('paciente_id', pacienteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as MensajeEnviado[];
  }
}
