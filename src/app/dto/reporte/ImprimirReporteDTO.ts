import { ReporteDTO } from "./ReporteDTO";


export class ImprimirReporteDTO{

    fecha!: string;
    efectivo!: number;
    externo!: number;
    ventas!: number;
    movimientos!: Array<{ motivo: string, valor: number, tipo: string }>;

    static crearReporte(caja: ReporteDTO): ImprimirReporteDTO 
    {
        let reporte = new ImprimirReporteDTO();
        reporte.fecha = new Date().toLocaleDateString();
        reporte.efectivo = 0;
        reporte.externo = 0;
        reporte.ventas = 0;
        reporte.movimientos = [];
        return reporte;
    }
}