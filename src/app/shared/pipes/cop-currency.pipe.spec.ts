import { CopCurrencyPipe } from './cop-currency.pipe';

describe('CopCurrencyPipe', () => {
  const pipe = new CopCurrencyPipe();

  it('formatea con separador de miles por punto y símbolo', () => {
    expect(pipe.transform(150000)).toBe('$ 150.000');
  });

  it('formatea montos grandes', () => {
    expect(pipe.transform(1234567)).toBe('$ 1.234.567');
  });

  it('acepta strings numéricos', () => {
    expect(pipe.transform('80000')).toBe('$ 80.000');
  });

  it('redondea decimales (COP sin decimales)', () => {
    expect(pipe.transform(150000.7)).toBe('$ 150.001');
  });

  it('devuelve "$ 0" para null/undefined/NaN', () => {
    expect(pipe.transform(null)).toBe('$ 0');
    expect(pipe.transform(undefined)).toBe('$ 0');
    expect(pipe.transform('abc')).toBe('$ 0');
  });

  it('omite el símbolo cuando showSymbol es false', () => {
    expect(pipe.transform(150000, false)).toBe('150.000');
    expect(pipe.transform(null, false)).toBe('0');
  });
});
