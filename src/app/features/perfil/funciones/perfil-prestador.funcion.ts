import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PrestadorForm {
  nit: string;
  razon_social: string;
  codigo_habilitacion_reps: string;
}

export const nitValido = (v: string): boolean => /^\d{6,10}(-?\d)?$/.test(v);
export const repsValido = (v: string): boolean => /^\d{8,12}$/.test(v);

/** Validador de campo opcional: vacío es válido, con valor debe cumplir `esValido`. */
export const opcionalValido =
  (esValido: (v: string) => boolean): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '').trim();
    return !v || esValido(v) ? null : { formato: true };
  };

export function prestadorAUpdate(v: PrestadorForm): {
  nit: string | null;
  razon_social: string | null;
  codigo_habilitacion_reps: string | null;
} {
  return {
    nit: v.nit.trim() || null,
    razon_social: v.razon_social.trim() || null,
    codigo_habilitacion_reps: v.codigo_habilitacion_reps.trim() || null,
  };
}
