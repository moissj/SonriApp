import { describe, it, expect } from 'vitest';
import { tieneAlergiaReal } from './alergia.funcion';

describe('tieneAlergiaReal', () => {
  it.each(['N/A', 'na', '', '  ', 'ninguna', null, undefined])('%j -> false', (v) => {
    expect(tieneAlergiaReal(v)).toBe(false);
  });

  it.each(['Penicilina', 'Latex'])('%s -> true', (v) => {
    expect(tieneAlergiaReal(v)).toBe(true);
  });
});
