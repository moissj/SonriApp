import { describe, it, expect } from 'vitest';
import { ESTADO_CITA, tonoAClasesBadge, TonoEstado } from './estado-cita';

const TONOS: TonoEstado[] = ['warning', 'primary', 'violet', 'success', 'neutral', 'danger'];

describe('estado-cita', () => {
  it('los 6 estados tienen label, tono válido e icono', () => {
    const estados = Object.values(ESTADO_CITA);
    expect(estados.length).toBe(6);
    for (const e of estados) {
      expect(e.label).not.toBe('');
      expect(TONOS).toContain(e.tono);
      expect(e.icono).not.toBe('');
    }
  });

  it('tonoAClasesBadge devuelve clases para cada tono', () => {
    for (const t of TONOS) {
      expect(tonoAClasesBadge(t)).toContain('bg-');
    }
  });
});
