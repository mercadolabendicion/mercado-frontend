import { FormaVenta } from "../formasVenta/FormaVenta";

export class ProductoCompletoDTO{

    codigo!: string;
    nombre!: string;
    activo!: boolean;
    fechaCreacion!: string;
    formaVentas!: FormaVenta[];

}