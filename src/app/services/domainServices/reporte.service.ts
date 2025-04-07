import { inject, Injectable } from "@angular/core";
import { ImprimirReporteDTO } from "src/app/dto/reporte/imprimirReporteDTO";
import { ReporteDTO } from "src/app/dto/reporte/ReporteDTO";
import { environment } from "src/app/env/env";

@Injectable({
    providedIn: 'root'
})
export class ReporteService {

    public imprimirReporte(reporteCaja: ReporteDTO) {
        this.generateInvoice(reporteCaja);
    }

    async generateInvoice(data: ReporteDTO) {
        try {
            // Cargar el archivo HTML
            const reporteHTML = await this.loadHTMLTemplate('assets/reporte.html');

            // Generar la factura con datos reemplazados
            const filledHTML = this.populateInvoiceTemplate(reporteHTML, data);

            // Abrir el HTML generado e imprimir
            this.openAndPrintHTML(filledHTML);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
        }
    }

    private async loadHTMLTemplate(path: string): Promise<string> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo HTML: ${response.statusText}`);
        }
        return response.text();
    }

    private populateInvoiceTemplate(template: string, data: ReporteDTO): string {
        const formatoDinero = (value: number) =>
            new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                useGrouping: true,
            }).format(value);

        // Generar filas de productos
        const movimientosHTML = data.movimientos
            .map(movimientos => `
                    <tr>
                        <td>${movimientos.motivo}</td>
                        <td>${movimientos.tipo}</td>
                        <td>${formatoDinero(movimientos.valor)}</td>
                    </tr>
                `)
            .join('');

        // Reemplazar marcadores
        return template
            .replace('{{fecha}}', data.fecha)
            .replace('{{efectivo}}', formatoDinero(data.efectivo))
            .replace('{{externo}}', formatoDinero(data.externo))
            .replace('{{ventas}}', formatoDinero(data.ventas))
            .replace('{{movimientos}}', movimientosHTML)
            .replace('{{nombreNegocio}}', environment.nombreNegocio)
            .replace('{{direccionNegocio}}', environment.direccionNegocio)
            .replace('{{gerenteNegocio}}', environment.gerenteNegocio)
            .replace('{{fechaExpedicion}}', environment.fechaExpedicion)
            .replace('{{telefonos}}', environment.telefonos)
            .replace('{{resolucionDIAN}}', environment.resolucionDian)
    }

    private openAndPrintHTML(html: string): void {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('No se pudo abrir la ventana de impresión');
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
}
