import { Injectable } from '@angular/core';
import { supabase } from '../../../core/supabase.client';
import { CatalogoConsentimiento, ConsentimientoPaciente } from '../models/consentimiento.model';
import { validarArchivoConsentimiento } from '../funciones/validar-archivo.funcion';
import { construirRutaStorage } from '../funciones/ruta-storage.funcion';

const BUCKET = 'consentimientos';
const COLUMNAS =
  'id, paciente_id, catalogo_id, plantilla_version, archivo_path, nombre_archivo, fecha_firma, estado, motivo_anulacion, created_at';

function mapear(r: any): ConsentimientoPaciente {
  return {
    id: r.id,
    pacienteId: r.paciente_id,
    catalogoId: r.catalogo_id,
    plantillaVersion: r.plantilla_version,
    archivoPath: r.archivo_path,
    nombreArchivo: r.nombre_archivo,
    fechaFirma: r.fecha_firma,
    estado: r.estado,
    motivoAnulacion: r.motivo_anulacion,
    createdAt: r.created_at,
    tipo: r.catalogo?.tipo,
    titulo: r.catalogo?.titulo,
  };
}

@Injectable({ providedIn: 'root' })
export class ConsentimientoService {
  async listarPorPaciente(pacienteId: string): Promise<ConsentimientoPaciente[]> {
    const { data, error } = await supabase
      .from('consentimientos_paciente')
      .select(`${COLUMNAS}, catalogo:catalogo_consentimientos(tipo, titulo)`)
      .eq('paciente_id', pacienteId)
      .order('fecha_firma', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapear);
  }

  async subir(a: {
    pacienteId: string;
    catalogo: CatalogoConsentimiento;
    archivo: File;
    fechaFirma: string;
  }): Promise<ConsentimientoPaciente> {
    const v = validarArchivoConsentimiento(a.archivo);
    if (!v.ok) throw new Error(v.error);
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Sesión no válida.');
    const path = construirRutaStorage(auth.user.id, a.pacienteId, a.archivo.name);
    const subida = await supabase.storage.from(BUCKET).upload(path, a.archivo);
    if (subida.error) throw subida.error;
    const { data, error } = await supabase
      .from('consentimientos_paciente')
      .insert({
        paciente_id: a.pacienteId,
        odontologo_id: auth.user.id,
        catalogo_id: a.catalogo.id,
        plantilla_version: a.catalogo.version,
        archivo_path: path,
        nombre_archivo: a.archivo.name,
        fecha_firma: a.fechaFirma,
        estado: 'vigente',
      })
      .select(COLUMNAS)
      .single();
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw error;
    }
    return { ...mapear(data), tipo: a.catalogo.tipo, titulo: a.catalogo.titulo };
  }

  async urlFirmada(archivoPath: string): Promise<string> {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(archivoPath, 60);
    if (error) throw error;
    return data.signedUrl;
  }

  async anular(id: string, motivo: string): Promise<void> {
    if (!motivo.trim()) throw new Error('El motivo es obligatorio.');
    const { error } = await supabase
      .from('consentimientos_paciente')
      .update({ estado: 'anulado', motivo_anulacion: motivo.trim() })
      .eq('id', id);
    if (error) throw error;
  }
}
