export interface CatalogoConsentimiento {
  id: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  version: number;
  activo: boolean;
}

export type EstadoConsentimiento = 'vigente' | 'anulado';

export interface ConsentimientoPaciente {
  id: string;
  pacienteId: string;
  catalogoId: string;
  plantillaVersion: number;
  archivoPath: string;
  nombreArchivo: string;
  fechaFirma: string;
  estado: EstadoConsentimiento;
  motivoAnulacion: string | null;
  createdAt: string;
  tipo?: string;
  titulo?: string;
}
