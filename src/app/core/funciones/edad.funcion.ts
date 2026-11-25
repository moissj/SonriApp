import { hoyBogota } from './fecha-bogota.funcion';

/** Edad en años (calendario America/Bogota) desde 'YYYY-MM-DD'; null si falta, es inválida o futura. */
export function calcularEdad(fechaNacimiento: string | null, hoy: string = hoyBogota()): number | null {
  const n = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaNacimiento ?? '');
  if (!n) return null;
  const [ay, am, ad] = hoy.split('-').map(Number);
  let edad = ay - +n[1];
  if (am < +n[2] || (am === +n[2] && ad < +n[3])) edad--;
  return edad < 0 ? null : edad;
}
