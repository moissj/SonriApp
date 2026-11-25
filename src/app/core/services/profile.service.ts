import { Injectable, inject, signal, effect } from '@angular/core';
import { supabase } from '../supabase.client';
import { AuthService } from './auth.service';

export interface Profile {
  id: string;
  nombre_completo: string;
  nombre_consultorio: string | null;
  telefono_contacto: string | null;
  ciudad: string | null;
  departamento: string | null;
  email: string | null;
  horario_apertura: string | null;
  horario_cierre: string | null;
  duracion_cita_defecto: number | null;
  logo_url: string | null;
  nit: string | null;
  razon_social: string | null;
  codigo_habilitacion_reps: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);
  private readonly _profile = signal<Profile | null>(null);
  private readonly _loading = signal(false);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    // Carga el perfil automáticamente en cuanto hay usuario autenticado,
    // sin depender del guard de onboarding (así /admin, dashboard, etc. lo tienen).
    effect(() => {
      const user = this.auth.user();
      if (user && !this._profile()) {
        void this.loadProfile();
      } else if (!user) {
        this._profile.set(null);
      }
    });
  }

  async loadProfile(): Promise<Profile | null> {
    const user = this.auth.user();
    if (!user) return null;

    this._loading.set(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      this._profile.set(data as Profile);
      return data as Profile;
    } catch {
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateProfile(updates: Partial<Profile>): Promise<void> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Refrescar el perfil local
    const current = this._profile();
    if (current) {
      this._profile.set({ ...current, ...updates });
    }
  }

  async uploadLogo(file: File): Promise<string> {
    const user = this.auth.user();
    if (!user) throw new Error('No hay usuario autenticado.');

    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('logos').getPublicUrl(path);
    return data.publicUrl;
  }

  get needsOnboarding(): boolean {
    // La cuenta la crea el admin (con nombre_consultorio). El onboarding solo
    // se muestra si el odontólogo aún no configuró sus horarios de atención.
    const p = this._profile();
    return p !== null && !p.horario_apertura;
  }
}
