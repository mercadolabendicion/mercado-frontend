export class ActualizarProductoDTO {
    
    codigo!: string;
    nombre!: string;
    precio!: number;
    cantidad!: number;

    static crearProducto(codigo: string, nombre: string, precio: number, cantidad: number): ActualizarProductoDTO {
        let producto = new ActualizarProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.precio = precio;
        producto.cantidad = cantidad;
        return producto;
    }
}