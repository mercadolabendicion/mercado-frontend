import {FormGroup } from "@angular/forms";

export class FormaVenta{


    nombre!: string;
    precioCompra!: number;
    precioVenta!: number;
    cantidad!: number;
    activo!: boolean;


    static toEntity(forma: FormGroup): FormaVenta {
        let formaVenta = new FormaVenta();
        console.log(forma);
        formaVenta.nombre = forma.get('nombre')?.value;
        formaVenta.precioCompra = forma.get('precioCompra')?.value;
        formaVenta.precioVenta = forma.get('precioVenta')?.value;
        formaVenta.cantidad = forma.get('cantidad')?.value;
        formaVenta.activo = true;
        return formaVenta;
    }
}