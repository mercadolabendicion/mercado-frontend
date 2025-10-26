import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpCajaMayorService } from '../http-services/httpCajaMayorService';
import { AlertService } from "src/app/utils/alert.service";
import { HistorialCajaMayorDTO } from '../../dto/caja/HistorialCajaMayorDTO';
import { EstadoCajaMayorDTO } from '../../dto/caja/EstadoCajaMayorDTO';

@Injectable({
    providedIn: 'root'
})
export class CajaMayorService {

    private httpCajaMayorService: HttpCajaMayorService = inject(HttpCajaMayorService);
    private alert: AlertService = inject(AlertService);

    /**
     * Este método se encarga de cerrar la caja mayor
     * @param valor - El valor con el que se cierra la caja
     */
    public cerrarCaja(valor: number): Observable<boolean> {
        return this.httpCajaMayorService.cerrarCaja(valor).pipe(
            tap(() => this.alert.simpleSuccessAlert('Caja mayor cerrada correctamente')),
            map(() => true),
            catchError((error) => {
                this.alert.simpleErrorAlert(error.error.mensaje || 'Error al cerrar la caja mayor');
                return of(false);
            })
        );
    }

    /**
     * Consulta el saldo actual de la caja mayor
     */
    public consultarSaldo(): Observable<number> {
        return this.httpCajaMayorService.consultarSaldo().pipe(
            catchError((error) => {
                console.error('Error al consultar saldo:', error);
                this.alert.simpleErrorAlert('Error al consultar el saldo de caja mayor');
                return of(0);
            })
        );
    }

    /**
 * Obtiene el estado completo de la caja mayor (id y saldo)
 */
    public obtenerEstado(): Observable<EstadoCajaMayorDTO | null> {
        return this.httpCajaMayorService.obtenerEstado().pipe(
            catchError((error) => {
                console.error('Error al obtener estado de caja mayor:', error);
                this.alert.simpleErrorAlert('Error al consultar el estado de caja mayor');
                return of(null);
            })
        );
    }

    /**
     * Obtiene el historial de cierres de caja mayor paginado
     * @param page - Número de página (empezando en 0)
     * @param size - Cantidad de registros por página
     */
    public obtenerHistorial(page: number, size: number): Observable<HistorialCajaMayorDTO[]> {
        return this.httpCajaMayorService.obtenerHistorial(page, size).pipe(
            catchError((error) => {
                console.error('Error al obtener historial:', error);
                this.alert.simpleErrorAlert('Error al cargar el historial de caja mayor');
                return of([]);
            })
        );
    }
}