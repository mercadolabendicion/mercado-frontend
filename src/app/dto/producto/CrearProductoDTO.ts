import { FormArray } from "@angular/forms";
import { FormaVenta } from "../formasVenta/FormaVenta";

export class CrearProductoDTO {
    
    codigo!: string;
    nombre!: string;
    fechaVencimiento!: string;
    lote!: string;
    impuesto!: string;
    precioCompra!: number;
    formasVenta!: FormaVenta[];

    static crearProductoDTO(codigo: string, nombre: string, fecha_vencimiento: string, lote: string, impuesto: string, 
      precioCompra: number, formasVenta: FormaVenta[]): CrearProductoDTO {

      let producto = new CrearProductoDTO();
      producto.codigo = codigo;
      producto.nombre = nombre;
      producto.fechaVencimiento = new Date(fecha_vencimiento).toISOString();
      producto.lote = lote;
      producto.impuesto = impuesto;
      producto.precioCompra = precioCompra;
      producto.formasVenta = formasVenta;
      return producto;
    }
}