import { Component, Input } from '@angular/core';

interface ProductoProximoVencer {
  codigo?: string;
  nombre: string;
  fechaVencimiento: string | Date;
  diasParaVencer: number;
}

@Component({
  selector: 'chart-productos-proximos-vencer',
  templateUrl: './productos-proximos-vencer.component.html',
  styleUrl: './productos-proximos-vencer.component.css'
})
export class ProductosProximosVencerComponent {
  @Input() productosProximosVencer: any[] = [];
  
  diasFiltro: number = 5;
  
  /**
   * Retorna los productos filtrados según el número de días seleccionado
   * @returns Array de productos que vencen dentro del número de días seleccionado
   */
  get productosFiltrados(): any[] {
    if (!this.productosProximosVencer || this.productosProximosVencer.length === 0) {
      return [];
    }
    return this.productosProximosVencer.filter(producto => {
      const dias = this.obtenerDiasParaVencer(producto);
      return dias <= this.diasFiltro;
    });
  }

  /**
   * Formatea una fecha al formato DD/MM/YYYY
   * @param fecha Fecha como string o Date
   * @returns Fecha formateada
   */
  formatearFecha(fecha: string | Date): string {
    if (!fecha) {
      return 'N/A';
    }
    try {
      const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return String(fecha);
    }
  }

  /**
   * Obtiene el código del producto
   * @param producto Objeto producto del API
   * @returns Código del producto
   */
  obtenerCodigo(producto: any): string {
    return producto?.codigo || producto?.codigoProducto || 'N/A';
  }

  /**
   * Obtiene el nombre del producto
   * @param producto Objeto producto del API
   * @returns Nombre del producto
   */
  obtenerNombre(producto: any): string {
    return producto?.nombre || producto?.nombreProducto || 'N/A';
  }

  /**
   * Obtiene la fecha de vencimiento del producto
   * @param producto Objeto producto del API
   * @returns Fecha de vencimiento
   */
  obtenerFechaVencimiento(producto: any): string | Date {
    return producto?.fechaVencimiento || 'N/A';
  }

  /**
   * Obtiene los días para vencer
   * @param producto Objeto producto del API
   * @returns Días para vencer
   */
  obtenerDiasParaVencer(producto: any): number {
    return producto?.diasParaVencer || 0;
  }
}
