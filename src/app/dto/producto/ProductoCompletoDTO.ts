import { FormaVenta } from "../formasVenta/FormaVenta";

export class ProductoCompletoDTO{

    codigo!: string;
    nombre!: string;
    impuesto!: string;
    fechaVencimiento!: string;
    lote!: string;
    fechaCreacion!: string;
    formaVentas!: FormaVenta[];

}