import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoDTO } from 'src/app/dto/movimiento/MovimientoDTO';
import { MovimientoResponseDTO } from 'src/app/dto/movimiento/MovimientoResponseDTO';
import { environment } from '../../env/env';

@Injectable({
    providedIn: 'root'
})
export class HttpMovimientosService {

    private URL_API: string = environment.ApiUrl;
    private http: HttpClient = inject(HttpClient);

    public crearMovimiento(movimiento: MovimientoDTO) {
        const params = new HttpParams()
            .set('valor', movimiento.valor.toString())
            .set('tipo', movimiento.tipo)
            .set('motivo', movimiento.motivo);

        return this.http.post(`${this.URL_API}/movimientos/crear`, null, { params });
    }

    public obtenerMovimientos(): Observable<MovimientoResponseDTO[]> {
        return this.http.get<MovimientoResponseDTO[]>(`${this.URL_API}/movimientos`);
    }

    public obtenerMovimientosPorFecha(fecha: string): Observable<MovimientoResponseDTO[]> {
        const params = new HttpParams().set('fecha', fecha);
        return this.http.get<MovimientoResponseDTO[]>(`${this.URL_API}/movimientos/fecha`, { params });
    }

    public obtenerMovimientosPaginados(page: number, size: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get(`${this.URL_API}/movimientos/paginados`, { params });
    }

    public eliminarMovimiento(id: string): Observable<any> {
        return this.http.delete(`${this.URL_API}/movimientos/eliminar/${id}`);
    }
}