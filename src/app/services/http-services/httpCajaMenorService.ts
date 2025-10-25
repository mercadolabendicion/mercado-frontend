import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';

@Injectable({
    providedIn: 'root'
})
export class HttpCajaMenorService {

    private URL_API: string = environment.ApiUrl;
    private http: HttpClient = inject(HttpClient);

    public cerrarCaja(valor: number): Observable<any> {
        const params = new HttpParams().set('valor', valor.toString());
        return this.http.post(`${this.URL_API}/caja-menor/cerrar`, null, { params });
    }

    public consultarSaldo(): Observable<number> {
        return this.http.get<number>(`${this.URL_API}/caja-menor/saldo`);
    }
}