import { FormArray } from "@angular/forms";
import { FormaVenta } from "../formasVenta/FormaVenta";

export class CrearProductoDTO {
    
    codigo!: string;
    nombre!: string;
    fechaVencimiento?: string | null;
    lote?: string | null;
    impuesto!: string;
    precioCompra!: number;
  formasVenta!: FormaVenta[];
  minimoStock?: number;

    static crearProductoDTO(codigo: string, nombre: string, fecha_vencimiento: string, lote: string, impuesto: string, 
      precioCompra: number, formasVenta: FormaVenta[], minimoStock: number = 0): CrearProductoDTO {

      let producto = new CrearProductoDTO();
      producto.codigo = codigo;
      producto.nombre = nombre;

      if (fecha_vencimiento && fecha_vencimiento.trim() !== '') {
        const fechaDate = new Date(fecha_vencimiento);
        if (!isNaN(fechaDate.getTime())) { // Verifica que sea una fecha válida
          producto.fechaVencimiento = fechaDate.toISOString();
        } else {
          producto.fechaVencimiento = null;
        }
      } else {
        producto.fechaVencimiento = null;
      }
      
      producto.lote = (lote && lote.trim() !== '') ? lote : null;
      producto.impuesto = impuesto;
      producto.precioCompra = precioCompra;
      producto.formasVenta = formasVenta;
      producto.minimoStock = minimoStock;
      return producto;
    }
}