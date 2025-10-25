import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpCajaMenorService } from '../http-services/httpCajaMenorService';
import { AlertService } from "src/app/utils/alert.service";

@Injectable({
    providedIn: 'root'
})
export class CajaMenorService {

    private httpCajaMenorService: HttpCajaMenorService = inject(HttpCajaMenorService);
    private alert: AlertService = inject(AlertService);

    /**
     * Este método se encarga de cerrar la caja menor
     * @param valor - El valor con el que se cierra la caja
     */
    public cerrarCaja(valor: number): Observable<boolean> {
        return this.httpCajaMenorService.cerrarCaja(valor).pipe(
            tap(() => this.alert.simpleSuccessAlert('Caja menor cerrada correctamente')),
            map(() => true),
            catchError((error) => {
                this.alert.simpleErrorAlert(error.error.mensaje || 'Error al cerrar la caja menor');
                return of(false);
            })
        );
    }

    /**
     * Consulta el saldo actual de la caja menor
     */
    public consultarSaldo(): Observable<number> {
        return this.httpCajaMenorService.consultarSaldo().pipe(
            catchError((error) => {
                console.error('Error al consultar saldo:', error);
                this.alert.simpleErrorAlert('Error al consultar el saldo de caja menor');
                return of(0);
            })
        );
    }
}