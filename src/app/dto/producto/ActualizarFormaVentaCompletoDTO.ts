import { ActualizarFormaVentaDTO } from "./ActualizarFormaVentaDTO";

export class ActualizarFormaVentaCompletoDTO {
    
    codigo!: string;
    nombreFormaVenta!: string;
    formaVentaDTO!: ActualizarFormaVentaDTO;

    static ActualizarFormaVentaCompleto (codigo: string, nombreFormaVenta: string, datosFormaVentaDTO: ActualizarFormaVentaDTO):
    ActualizarFormaVentaCompletoDTO {
        let formaVenta = new ActualizarFormaVentaCompletoDTO();
        formaVenta.codigo = codigo;
        formaVenta.nombreFormaVenta = nombreFormaVenta;
        formaVenta.formaVentaDTO = datosFormaVentaDTO;
        return formaVenta;
    }
}