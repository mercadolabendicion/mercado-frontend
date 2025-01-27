export class ProductoDTO {
  
  codigo!: string;
  nombre!: string;
  activo!: boolean;
  fechaCreacion!: Date;

  static crearProductoDTO(codigo: any, nombre: any, precio: any) {
    let producto = new ProductoDTO();
    producto.codigo = codigo;
    producto.nombre = nombre;
    producto.activo = true;
    producto.fechaCreacion = new Date();
    return producto;
  }
}