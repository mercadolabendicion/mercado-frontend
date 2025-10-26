import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';
import { HistorialCajaMayorDTO } from '../../dto/caja/HistorialCajaMayorDTO';

@Injectable({
    providedIn: 'root'
})
export class HttpCajaMayorService {

    private URL_API: string = environment.ApiUrl;
    private http: HttpClient = inject(HttpClient);

    public cerrarCaja(valor: number): Observable<any> {
        const params = new HttpParams().set('valor', valor.toString());
        return this.http.post(`${this.URL_API}/caja-mayor/cerrar`, null, { params });
    }

    public consultarSaldo(): Observable<number> {
        return this.http.get<number>(`${this.URL_API}/caja-mayor/saldo`);
    }

    public obtenerHistorial(page: number, size: number): Observable<HistorialCajaMayorDTO[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<HistorialCajaMayorDTO[]>(`${this.URL_API}/caja-mayor/historial`, { params });
    }
}