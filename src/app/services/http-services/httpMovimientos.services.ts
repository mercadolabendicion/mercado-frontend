import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MovimientoDTO } from 'src/app/dto/movimiento/MovimientoDTO';
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
}