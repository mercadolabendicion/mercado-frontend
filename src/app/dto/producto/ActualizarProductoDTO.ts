export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    impuesto!: string;
    fechaVencimiento!: string;
    lote!: string;
    minimoStock?: number;

    static actualizarProducto(codigo: string, nombre: string, tipoImpuesto: string, fechaVencimiento: string, lote: string, minimoStock: number = 0): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.impuesto = tipoImpuesto;
        producto.fechaVencimiento = fechaVencimiento;
        producto.lote = lote;
        producto.minimoStock = minimoStock;
        return producto;
    }
}