import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MovimientoDTO } from 'src/app/dto/movimiento/MovimientoDTO';
import { HttpMovimientosService } from '../http-services/httpMovimientos.services';
import { AlertService } from "src/app/utils/alert.service";
import { MovimientoResponseDTO } from 'src/app/dto/movimiento/MovimientoResponseDTO';

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

    /**
     * Obtiene todos los movimientos
     */
    public obtenerMovimientos(): Observable<MovimientoResponseDTO[]> {
        return this.httpMovimientoService.obtenerMovimientos().pipe(
            catchError((error) => {
                console.error('Error al obtener movimientos:', error);
                this.alert.simpleErrorAlert('Error al cargar los movimientos');
                return of([]);
            })
        );
    }

    /**
     * Obtiene los movimientos filtrados por fecha
     * @param fecha Fecha en formato YYYY-MM-DD
     */
    public obtenerMovimientosPorFecha(fecha: string): Observable<MovimientoResponseDTO[]> {
        return this.httpMovimientoService.obtenerMovimientosPorFecha(fecha).pipe(
            catchError((error) => {
                console.warn('Error al obtener movimientos por fecha:', error.error.mensaje);
                return of([]);
            })
        );
    }

    /**
     * Obtiene los movimientos paginados
     * @param page Número de página
     * @param size Tamaño de página
     */
    public obtenerMovimientosPaginados(page: number, size: number): Observable<any> {
        return this.httpMovimientoService.obtenerMovimientosPaginados(page, size).pipe(
            catchError((error) => {
                console.error('Error al obtener movimientos paginados:', error);
                this.alert.simpleErrorAlert('Error al cargar los movimientos');
                return of({ content: [], totalElements: 0 });
            })
        );
    }
}