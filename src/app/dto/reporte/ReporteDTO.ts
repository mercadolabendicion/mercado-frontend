export class ReporteDTO{
    fecha!: string;
    efectivo!: number;
    externo!: number;
    ventas!: number;
    movimientos!: Array<{ motivo: string, valor: number, tipo: string }>;

    static crearReporte(efectivo:number, externo:number, ventas:number, movimientos: Array<{ motivo: string, valor: number, tipo: string }>): ReporteDTO 
    {
        let reporte = new ReporteDTO();
        reporte.fecha = new Date().toLocaleDateString();
        reporte.efectivo = efectivo;
        reporte.externo = externo;
        reporte.ventas = ventas;
        reporte.movimientos = movimientos;
        return reporte;
    }
}