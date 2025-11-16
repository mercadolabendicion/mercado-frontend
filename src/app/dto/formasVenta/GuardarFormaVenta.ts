import { FormaVenta } from "./FormaVenta";

export class GuardarFormaVenta {
    
    codigo!: string;
    formaVentaDTO!: FormaVenta;


    static crearFormaVenta(codigo: string, nombre: string, precioCompra: number, precioVenta: number, cantidad: number, minimoStock: number = 0) {
        let formaVenta = new FormaVenta();
        formaVenta.nombre = nombre;
        formaVenta.precioCompra = precioCompra;
        formaVenta.precioVenta = precioVenta;
        formaVenta.cantidad = cantidad;
        formaVenta.minimoStock = minimoStock;
        let guardarFormaVenta = new GuardarFormaVenta();
        guardarFormaVenta.codigo = codigo;
        guardarFormaVenta.formaVentaDTO = formaVenta;
        return guardarFormaVenta;
    }
}