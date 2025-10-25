import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MovimientoDTO } from 'src/app/dto/movimiento/MovimientoDTO';
import { HttpMovimientosService } from '../http-services/httpMovimientos.services';
import { AlertService } from "src/app/utils/alert.service";

@Injectable({
    providedIn: 'root'
})
export class MovimientoService {

    private httpMovimientoService: HttpMovimientosService = inject(HttpMovimientosService);
    private alert: AlertService = inject(AlertService);

    /**
     * Este método se encarga de guardar un movimiento en la base de datos
     * @param movimiento es el movimiento a guardar
     */
    public crearMovimiento(movimiento: MovimientoDTO): Observable<boolean> {
        return this.httpMovimientoService.crearMovimiento(movimiento).pipe(
            tap(() => this.alert.simpleSuccessAlert('Movimiento registrado correctamente')),
            map(() => true),
            catchError((error) => {
                this.alert.simpleErrorAlert(error.error.mensaje || 'Error al registrar el movimiento');
                return of(false);
            })
        );
    }
}