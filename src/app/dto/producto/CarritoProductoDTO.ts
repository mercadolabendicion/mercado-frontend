export class CarritoProductoDTO {
    
    codigo!: string;
    nombre!: string;
    cantidad!: number;
    codigoProducto!: string;
    formaVenta!: string;
    precio !: number;

    static crearProducto(codigo: string, nombre: string, precio: number, cantidad: number, formaVenta:string): CarritoProductoDTO {
        let producto = new CarritoProductoDTO();
        producto.codigo = codigo;
        producto.nombre = nombre;
        producto.cantidad = cantidad;
        producto.codigoProducto = codigo;
        producto.formaVenta = formaVenta;
        producto.precio = precio;
        return producto
    }
}