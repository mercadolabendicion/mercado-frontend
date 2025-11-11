import { Injectable } from '@angular/core';

/**
 * Servicio compartido para manejar la lógica de paginación
 * Elimina la duplicación de código de paginación en múltiples componentes
 */
@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  /**
   * Calcula el rango de páginas visibles basado en el ancho de la pantalla
   * Utiliza los puntos de corte de Bootstrap para determinar cuántas páginas mostrar
   * 
   * @returns número de páginas visibles según el tamaño de pantalla
   */
  calcularRangoVisible(): number {
    const anchoPantalla = window.innerWidth;
    if (anchoPantalla < 576) { // Bootstrap 'sm' breakpoint
      return 3;
    } else if (anchoPantalla >= 768) {
      return 7;
    } else {
      return 5; // Para pantallas medianas
    }
  }

  /**
   * Genera un arreglo con el rango de páginas que deben mostrarse
   * en la paginación, basado en la página actual y el rangoVisible definido.
   * 
   * @param paginaActual - La página actualmente seleccionada
   * @param totalPaginas - Total de páginas disponibles
   * @param rangoVisible - Número de páginas a mostrar en el paginador
   * @returns arreglo de números que representa las páginas visibles
   */
  obtenerPaginasVisibles(paginaActual: number, totalPaginas: number, rangoVisible: number): number[] {
    const mitad = Math.floor(rangoVisible / 2);
    let inicio = Math.max(paginaActual - mitad, 0);
    let fin = Math.min(inicio + rangoVisible, totalPaginas);
  
    if (fin - inicio < rangoVisible) {
      inicio = Math.max(fin - rangoVisible, 0);
    }
  
    return Array.from({ length: fin - inicio }, (_, i) => i + inicio);
  }

  /**
   * Genera un arreglo con todos los números de página disponibles
   * 
   * @param totalPaginas - Total de páginas disponibles
   * @returns arreglo con todos los índices de página
   */
  generarPaginas(totalPaginas: number): number[] {
    return Array.from({ length: totalPaginas }, (_, index) => index);
  }

  /**
   * Verifica si se puede ir a la página siguiente
   * 
   * @param paginaActual - La página actualmente seleccionada
   * @param totalPaginas - Total de páginas disponibles
   * @returns true si se puede avanzar
   */
  puedeAvanzar(paginaActual: number, totalPaginas: number): boolean {
    return paginaActual < totalPaginas - 1;
  }

  /**
   * Verifica si se puede ir a la página anterior
   * 
   * @param paginaActual - La página actualmente seleccionada
   * @returns true si se puede retroceder
   */
  puedeRetroceder(paginaActual: number): boolean {
    return paginaActual > 0;
  }
}
