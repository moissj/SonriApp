import type { RegimenEps } from './eps.service';

/**
 * Set base de EPS de Colombia para sembrar el catálogo global.
 * Fuente: `scripts/eps_colombia.json` (listado ADRES).
 * shortcut: cada EPS se registra con un único régimen; las marcadas "Ambos" en la
 * fuente se cargan como 'contributivo'. Si el negocio necesita distinguir contributivo
 * y subsidiado para la misma EPS, dividir esa EPS en dos filas.
 */
export const EPS_BASE: ReadonlyArray<{ nombre: string; regimen: RegimenEps }> = [
  { nombre: 'EPS SURAMERICANA S.A.', regimen: 'contributivo' },
  { nombre: 'ENTIDAD PROMOTORA DE SALUD SANITAS S.A.S.', regimen: 'contributivo' },
  { nombre: 'CAJA DE COMPENSACIÓN FAMILIAR COMPENSAR', regimen: 'contributivo' },
  { nombre: 'NUEVA EPS S.A.', regimen: 'contributivo' },
  { nombre: 'SALUD TOTAL ENTIDAD PROMOTORA DE SALUD S.A.', regimen: 'contributivo' },
  { nombre: 'EPS FAMISANAR S.A.S.', regimen: 'contributivo' },
  { nombre: 'COOSALUD EPS S.A.', regimen: 'contributivo' },
  { nombre: 'ASOCIACION MUTUAL SER EMPRESA SOLIDARIA DE SALUD EPS', regimen: 'contributivo' },
  { nombre: 'ASMET SALUD EPS S.A.S.', regimen: 'subsidiado' },
  { nombre: 'EMSSANAR E.S.S.', regimen: 'subsidiado' },
  { nombre: 'CAPITAL SALUD ENTIDAD PROMOTORA DE SALUD SAS', regimen: 'contributivo' },
  { nombre: 'ALIANZA MEDELLIN ANTIOQUIA EPS S.A.S. SAVIA SALUD', regimen: 'subsidiado' },
  { nombre: 'ALIANSALUD ENTIDAD PROMOTORA DE SALUD S.A.', regimen: 'contributivo' },
  { nombre: 'ENTIDAD PROMOTORA DE SALUD SERVICIO OCCIDENTAL DE SALUD S.A.', regimen: 'contributivo' },
  { nombre: 'CAJA DE COMPENSACION FAMILIAR DEL VALLE DEL CAUCA COMFENALCO VALLE', regimen: 'contributivo' },
  { nombre: 'CAJACOPI ATLÁNTICO - CCF DEL ATLÁNTICO', regimen: 'contributivo' },
  { nombre: 'CAPRESOCA E.P.S.', regimen: 'subsidiado' },
  { nombre: 'CAJA DE COMPENSACION FAMILIAR DEL CHOCO COMFACHOCO', regimen: 'subsidiado' },
  { nombre: 'SALUD BOLÍVAR EPS SAS', regimen: 'contributivo' },
  { nombre: 'EPS FAMILIAR DE COLOMBIA SAS', regimen: 'subsidiado' },
  { nombre: 'EMPRESA PROMOTORA DE SALUD INDÍGENA ANAS WAYUU EPSI', regimen: 'subsidiado' },
  { nombre: 'ENTIDAD PROMOTORA DE SALUD MALLAMAS EPSI', regimen: 'subsidiado' },
  { nombre: 'PIJAOS SALUD EPSI', regimen: 'subsidiado' },
  { nombre: 'ASOCIACIÓN DE CABILDOS INDÍGENAS DEL CESAR Y GUAJIRA DUSAKAWI', regimen: 'subsidiado' },
  { nombre: 'AIC - ASOCIACIÓN INDÍGENA DEL CAUCA EPSI', regimen: 'subsidiado' },
  { nombre: 'EMPRESAS PÚBLICAS DE MEDELLÍN EPM (PROGRAMA DE SALUD)', regimen: 'especial' },
  { nombre: 'FONDO DE PASIVO SOCIAL DE FERROCARRILES NACIONALES DE COLOMBIA', regimen: 'especial' },
  { nombre: 'FUNDACIÓN SALUD MÍA EPS', regimen: 'contributivo' },
];
