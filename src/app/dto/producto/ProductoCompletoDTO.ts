import { FormaVenta } from "../formasVenta/FormaVenta";

export class ProductoCompletoDTO{

    codigo!: string;
    nombre!: string;
    impuesto!: string;
    fechaCreacion!: string;
    formaVentas!: FormaVenta[];

}