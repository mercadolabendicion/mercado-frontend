import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpCajaMenorService } from '../http-services/httpCajaMenorService';
import { HistorialCajaMenorDTO } from '../../dto/caja/HistorialCajaMenorDTO';
import { AlertService } from "src/app/utils/alert.service";
import { Page } from 'src/app/dto/pageable/Page';

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

    /**
     * Obtiene el historial de cierres de caja menor paginado
     * @param page - Número de página (empezando en 0)
     * @param size - Cantidad de registros por página
     */
    public obtenerHistorial(page: number, size: number): Observable<Page<HistorialCajaMenorDTO>> {
  return this.httpCajaMenorService.obtenerHistorial(page, size).pipe(
    catchError((error) => {
      console.error('Error al obtener historial:', error);
      this.alert.simpleErrorAlert('Error al cargar el historial de caja menor');

      const emptyPage: Page<HistorialCajaMenorDTO> = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        last: true,
        first: true,
        numberOfElements: 0,
        pageable: {
          pageNumber: page,
          pageSize: size,
          offset: 0,
          paged: true,
          unpaged: false,
          sort: {
            sorted: false,
            unsorted: true,
            empty: true
          }
        },
        size: size,
        number: page,
        sort: {
          sorted: false,
          unsorted: true,
          empty: true
        },
        empty: true
      };

      return of(emptyPage);
    })
  );
}


}