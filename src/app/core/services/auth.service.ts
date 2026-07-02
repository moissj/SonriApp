import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthError, User } from '@supabase/supabase-js';
import { supabase } from '../supabase.client';

export type RolUsuario = 'super_admin' | 'odontologo';

const ERROR_MAP: Record<string, string> = {
  'invalid login credentials': 'Correo o contraseña incorrectos.',
  'email not confirmed': 'Debes confirmar tu correo antes de ingresar.',
  'password should be at least 6 characters': 'La contraseña debe tener mínimo 6 caracteres.',
  'rate limit exceeded': 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  'network request failed': 'Sin conexión a internet. Verifica tu red.',
  'email address is invalid': 'Ingresa un correo electrónico válido.',
};

/** Error de acceso con mensaje ya listo para mostrar al usuario. */
export class AccountAccessError extends Error {}

export function mapAuthError(error: AuthError | Error): string {
  // Mensajes de acceso ya vienen redactados para el usuario final
  if (error instanceof AccountAccessError) return error.message;
  const msg = error.message.toLowerCase();
  for (const [key, label] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return label;
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  private readonly _rol = signal<RolUsuario | null>(null);
  private readonly _loading = signal(true);

  readonly user = this._user.asReadonly();
  readonly rol = this._rol.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isSuperAdmin = computed(() => this._rol() === 'super_admin');
  readonly isLoading = this._loading.asReadonly();

  constructor(private readonly router: Router) {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      this._user.set(u);
      if (u) await this.loadRol(u.id);
      this._loading.set(false);
    });

    supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      this._user.set(u);
      if (u) {
        void this.loadRol(u.id);
      } else {
        this._rol.set(null);
      }
    });
  }

  private async loadRol(userId: string): Promise<void> {
    const { data } = await supabase.from('profiles').select('rol').eq('id', userId).single();
    this._rol.set((data?.rol as RolUsuario) ?? null);
  }

  /**
   * Inicia sesión y valida el estado de la cuenta.
   * Cierra la sesión y lanza AccountAccessError si la cuenta está
   * suspendida o el plan venció.
   */
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.user.id;
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('rol, estado_cuenta, fecha_vencimiento_plan')
      .eq('id', userId)
      .single();

    if (pErr || !profile) {
      await supabase.auth.signOut();
      throw new AccountAccessError('No se encontró el perfil de la cuenta. Contacta al administrador.');
    }

    const hoy = new Date().toISOString().split('T')[0];

    if (profile.estado_cuenta === 'suspendido') {
      await supabase.auth.signOut();
      throw new AccountAccessError(
        'Tu cuenta está suspendida. Contacta al administrador de SonriApp para más información.'
      );
    }

    if (
      profile.estado_cuenta === 'vencido' ||
      (profile.fecha_vencimiento_plan && profile.fecha_vencimiento_plan < hoy)
    ) {
      await supabase.auth.signOut();
      throw new AccountAccessError('Tu plan ha vencido. Contacta al administrador para renovarlo.');
    }

    // Acceso permitido
    this._rol.set(profile.rol as RolUsuario);
    await this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    this._rol.set(null);
    await this.router.navigate(['/auth/login']);
  }

  async recoverPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  }

  /** Define una nueva contraseña para la sesión actual (recuperación/invitación) */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
}
