export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    impuesto!: string;

    static actualizarProducto(codigo: string, nombre: string, tipoImpuesto: string): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.impuesto = tipoImpuesto;
        return producto;
    }
}