import { HistoriaDental } from '../examen-ingreso.service';

/** Fija `valor` de todos los campos; `apertura` usa normal/alterada. Conserva lado/observacion. */
export function aplicarTodosHd(hd: HistoriaDental, valor: 'si' | 'no'): HistoriaDental {
  const nuevo = { ...hd };
  for (const k of Object.keys(hd) as (keyof HistoriaDental)[]) {
    if (k === 'frecuencia_cepillado') continue; // valor numérico 1..6, no S/N
    const v = k === 'apertura' ? (valor === 'no' ? 'normal' : 'alterada') : valor;
    nuevo[k] = { ...hd[k], valor: v };
  }
  return nuevo;
}
