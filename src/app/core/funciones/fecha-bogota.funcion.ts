const ZONA = 'America/Bogota';

/** YYYY-MM-DD en America/Bogota (en-CA produce ese formato). */
export function aFechaBogota(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function hoyBogota(): string {
  return aFechaBogota(new Date());
}

/** p. ej. "martes, 24 de noviembre de 2026". */
export function fechaLargaBogota(d: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
