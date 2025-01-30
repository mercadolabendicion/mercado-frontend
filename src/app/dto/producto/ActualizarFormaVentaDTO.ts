export class ActualizarFormaVentaDTO {

    nuevoNombre!: string;
    precioCompra!: number;
    precioVenta!: number;
    cantidad!: number;


    static actualizarFormaVenta(nuevoNombre: string, precioCompra: number, precioVenta: number, cantidad: number): ActualizarFormaVentaDTO {
        let formaVenta = new ActualizarFormaVentaDTO();
        formaVenta.nuevoNombre = nuevoNombre;
        formaVenta.precioCompra = precioCompra;
        formaVenta.precioVenta = precioVenta;
        formaVenta.cantidad = cantidad;
        return formaVenta;
    }
}
