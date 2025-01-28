export class CrearEFacturaDTO{
    idVenta!: number;
    fecha!: Date;

    static crearCrearEFacturaDTO(idVenta: number): CrearEFacturaDTO {
        let eFactura = new CrearEFacturaDTO();
        eFactura.idVenta = idVenta;
        eFactura.fecha = new Date();
        return eFactura;
    }
}