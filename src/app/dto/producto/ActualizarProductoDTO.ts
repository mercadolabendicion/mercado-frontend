export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    impuesto!: string;
    fechaVencimiento!: string;
    lote!: string;

    static actualizarProducto(codigo: string, nombre: string, tipoImpuesto: string, fechaVencimiento: string, lote: string): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.impuesto = tipoImpuesto;
        producto.fechaVencimiento = fechaVencimiento;
        producto.lote = lote;
        return producto;
    }
}