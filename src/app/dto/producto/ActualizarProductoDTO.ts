export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    activo!: boolean;
    fechaCreacion!: Date;

    static crearProducto(codigo: string, nombre: string, activo: number, fechaCreacion: Date): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.activo = activo == 1;
        producto.fechaCreacion = new Date();
        return producto;
    }
}