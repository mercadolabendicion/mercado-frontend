import {FormGroup } from "@angular/forms";

export class FormaVenta{


    nombre!: string;
    precioCompra!: number;
    precioVenta!: number;
    cantidad!: number;
    minimoStock!: number;

    static toEntity(forma: FormGroup): FormaVenta {
        let formaVenta = new FormaVenta();
        formaVenta.nombre = forma.get('nombre')?.value;
        formaVenta.precioCompra = +forma.get('precioCompra')?.value.replace(/[^0-9,]/g, '').replace(',', '').replace('$', '');
        formaVenta.precioVenta = +forma.get('precioVenta')?.value.replace(/[^0-9,]/g, '').replace(',', '').replace('$', '');
        formaVenta.cantidad = forma.get('cantidad')?.value;
        // El control en la UI se llama 'minimoDisponible', pero en la entidad/DTO se usa 'minimoStock'
        formaVenta.minimoStock = forma.get('minimoDisponible')?.value ?? 0;
        return formaVenta;
    }
}