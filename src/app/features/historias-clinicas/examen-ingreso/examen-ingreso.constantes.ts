import {
  ChecklistEntry,
  ExploracionFacial,
  HistoriaDental,
  LateralidadMordida,
} from './examen-ingreso.service';

export const ANTECEDENTES_NOMBRES = [
  'Tratamiento médico actual',
  'Ingestión de medicamentos',
  'Cardiacos',
  'Pulmonares',
  'Circulación',
  'Renales',
  'Diabetes',
  'Trastorno de coagulación',
  'Enfermedad infecto-contagiosa',
  'Hepatitis',
  'Hiper o hipotensión',
  'Úlceras gástricas',
  'Fiebre reumática',
  'Antecedentes quirúrgicos',
  'Sida',
  'Reacciones alérgicas',
  'Ginecológicos o embarazo',
  'Psiquiátricos neurológicos',
  'Fracturas o traumas',
  'Hospitalizaciones',
  'Covid-19',
] as const;

export const TEJIDOS_NOMBRES = [
  'Labio superior',
  'Labio inferior',
  'Carrillos',
  'Comisuras',
  'Lengua',
  'Surco vestibular',
  'Úvula',
  'Paladar duro',
  'Paladar blando',
  'Piso de la boca',
  'Glándulas salivales',
  'Frenillo labial superior',
  'Frenillo labial inferior',
  'Frenillo lingual',
  'Encías',
  'Musculares',
] as const;

export const DEFAULT_HISTORIA_DENTAL: HistoriaDental = {
  tratamiento_ortopedico: { valor: null, observacion: '' },
  recambio_tardio:        { valor: null },
  dolor_atm:              { valor: null, lado: null },
  ruido_articular:        { valor: null, lado: null },
  apertura:               { valor: null },
  desviacion_apertura:    { valor: null, lado: null },
  ausencias_congenitas:   { valor: null },
  succion_digital:        { valor: null },
  habito_lengua:          { valor: null },
  habito_unas:            { valor: null },
  chupete:                { valor: null },
  traumas_quistes:        { valor: null, observacion: '' },
  sensibilidad:           { valor: null, observacion: '' },
  cuellos_expuestos:      { valor: null, observacion: '' },
  habitos_orales:         { valor: null },
  supernumerarios:        { valor: null, observacion: '' },
  sellantes:              { valor: null, observacion: '' },
  frecuencia_cepillado:   { valor: null },
  uso_seda:               { valor: null },
  uso_enjuague:           { valor: null, observacion: '' },
};

const MORDIDA_VACIA: LateralidadMordida = {
  valor: null, anterior: false, posterior: false, izquierda: false, derecha: false,
};

export const DEFAULT_EXPLORACION_FACIAL: ExploracionFacial = {
  perfil: null,
  asimetria_facial: null,
  asimetria_obs: '',
  forma_cara: null,
  patron_crecimiento: null,
  nariz: null,
  posicion_labial: '',
  respirador_oral: null,
  ronca: null,
  apnea_sueno: null,
  apnea_diagnosticada: null,
  uso_cpap: null,
  aparato_removible_no_cpap: null,
  menton: null,
  ojeras: null,
  mordida_abierta: { ...MORDIDA_VACIA },
  mordida_cruzada: { ...MORDIDA_VACIA },
  mordida_profunda: { ...MORDIDA_VACIA },
  anomalias: {
    rotaciones: null, diastemas: null, translocaciones: null, giroversiones: null,
    ausencias: null, retenidos: null, apinamientos: null, descripcion: '',
  },
  planos_terminales: null,
  tipo_denticion: null,
  descripcion_modelos: '',
};

export function buildDefaultChecklist(nombres: readonly string[]): ChecklistEntry[] {
  return nombres.map((n) => ({ nombre: n, valor: null, observacion: '' }));
}
