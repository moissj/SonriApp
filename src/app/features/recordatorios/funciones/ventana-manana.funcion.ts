/** Límites del día siguiente en America/Bogota (UTC-5 fijo, sin DST). */
export function ventanaManana(now: Date): { inicio: string; fin: string } {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(now);
  const [y, m, d] = hoy.split('-').map(Number);
  const manana = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return { inicio: `${manana}T00:00:00-05:00`, fin: `${manana}T23:59:59.999-05:00` };
}
