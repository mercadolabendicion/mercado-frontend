import { Injectable } from '@angular/core';

/**
 * Servicio compartido para manejar formateo de valores numéricos
 * Elimina duplicación de código en múltiples componentes
 */
@Injectable({
  providedIn: 'root'
})
export class FormatService {

  /**
   * Formatea un valor de entrada como número con separadores de miles
   * 
   * @param event - Evento del input
   * @param locale - Configuración de locale para formateo (default: 'en-US')
   * @returns El valor numérico sin formato y el valor formateado
   */
  formatearValorInput(event: Event, locale: string = 'en-US'): { valorNumerico: number, valorFormateado: string } {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, '');

    if (valorSinFormato === '') {
      input.value = '';
      return { valorNumerico: 0, valorFormateado: '' };
    }

    const valorNumerico = parseInt(valorSinFormato, 10);

    if (!isNaN(valorNumerico)) {
      const valorFormateado = valorNumerico.toLocaleString(locale);
      input.value = valorFormateado;
      return { valorNumerico, valorFormateado };
    }

    input.value = '';
    return { valorNumerico: 0, valorFormateado: '' };
  }

  /**
   * Convierte un string con formato de moneda a número
   * 
   * @param valorFormateado - String con formato de moneda (ej: "$1,234" o "1,234")
   * @returns El valor numérico
   */
  parsearValorFormateado(valorFormateado: string): number {
    const valorSinFormato = valorFormateado.replace(/[\$,]/g, '');
    const valorNumerico = parseInt(valorSinFormato, 10);
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  /**
   * Formatea un número a string con separadores de miles
   * 
   * @param valor - Número a formatear
   * @param locale - Configuración de locale (default: 'en-US')
   * @returns String formateado
   */
  formatearNumero(valor: number, locale: string = 'en-US'): string {
    return valor.toLocaleString(locale);
  }
}
