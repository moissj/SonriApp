export function construirRutaStorage(
  odontologoId: string,
  pacienteId: string,
  nombreArchivo: string,
  uuid: string = crypto.randomUUID(),
): string {
  const limpio = nombreArchivo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '');
  return `${odontologoId}/${pacienteId}/${uuid}-${limpio}`;
}
