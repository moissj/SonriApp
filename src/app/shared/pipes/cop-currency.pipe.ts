import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un valor numérico como moneda colombiana (COP), sin decimales
 * y con separador de miles por punto. Ej: 150000 -> "$ 150.000".
 *
 * Pipe único reutilizable para toda la app (DRY): no formatear montos a mano.
 *
 * Uso: {{ precio | copCurrency }}  o  {{ precio | copCurrency:false }} (sin símbolo)
 */
@Pipe({
  name: 'copCurrency',
  standalone: true,
})
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSymbol: boolean = true): string {
    const num = typeof value === 'string' ? Number(value) : value;

    if (num === null || num === undefined || Number.isNaN(num)) {
      return showSymbol ? '$ 0' : '0';
    }

    // Redondear a entero (COP sin decimales) y formatear con separador de miles "."
    const formatted = Math.round(num).toLocaleString('es-CO', {
      maximumFractionDigits: 0,
    });

    return showSymbol ? `$ ${formatted}` : formatted;
  }
}
