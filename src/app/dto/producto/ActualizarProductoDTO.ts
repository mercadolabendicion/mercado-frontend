export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    tipoImpuesto!: string;
    activo!: boolean;

    static actualizarProducto(codigo: string, nombre: string, tipoImpuesto: string, activo: boolean): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.tipoImpuesto = tipoImpuesto;
        producto.activo = activo;
        return producto;
    }
}