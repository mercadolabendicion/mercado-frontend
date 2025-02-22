export class ProductoFacturaDTO {
    producto!: string;
    cantidad!: number;
    total!: number;
    formaVenta!: string;

    constructor(producto: string, cantidad: number, total: number, forma: string) {
        this.producto = producto;
        this.cantidad = cantidad;
        this.total = total;
        this.formaVenta = forma;
    }
}