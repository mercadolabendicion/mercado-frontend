import { Component, Input } from '@angular/core';

interface ProductoMasVendido {
  codigoProducto?: string;
  nombreProducto: string;
  cantidadVendida: number;
  totalVentas: number;
  // Campos alternativos que pueden venir del backend
  id?: string;
  nombre?: string;
  cantidad?: number;
  ingresos?: number;
}

@Component({
  selector: 'chart-lista-mas-vendidos',
  templateUrl: './lista-mas-vendidos.component.html',
  styleUrl: './lista-mas-vendidos.component.css'
})
export class ListaMasVendidosComponent {
  @Input() productosMasVendidos: any[] = [];

  /**
   * Formatea un número como moneda en formato COP (Colombia)
   * @param valor Valor numérico a formatear
   * @returns Valor formateado como moneda
   */
  formatearMoneda(valor: number): string {
    if (!valor) {
      return '$ 0';
    }
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Obtiene el nombre del producto desde el objeto que puede tener diferentes estructuras
   * @param producto Objeto producto del API
   * @returns Nombre del producto
   */
  obtenerNombre(producto: any): string {
    return producto?.nombreProducto || producto?.nombre || 'N/A';
  }

  /**
   * Obtiene la cantidad vendida desde el objeto que puede tener diferentes estructuras
   * @param producto Objeto producto del API
   * @returns Cantidad vendida
   */
  obtenerCantidad(producto: any): number {
    return producto?.cantidadVendida || producto?.cantidad || 0;
  }

  /**
   * Obtiene el total de ventas/ingresos desde el objeto que puede tener diferentes estructuras
   * @param producto Objeto producto del API
   * @returns Total de ventas
   */
  obtenerTotalVentas(producto: any): number {
    return producto?.totalVentas || producto?.ingresos || 0;
  }
}
