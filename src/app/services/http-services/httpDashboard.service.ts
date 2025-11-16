import { inject, Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardEstadisticasDTO } from '../../dto/dashboard/DashboardEstadisticasDTO';

@Injectable({
    providedIn: 'root'
})
export class HttpDashboardService {

    private URL_API: string = environment.ApiUrl;
    private http: HttpClient = inject(HttpClient);

    /**
     * Obtiene las estadísticas del dashboard para un rango de fechas
     * @param fechaInicio Fecha inicial en formato YYYY-MM-DD
     * @param fechaFin Fecha final en formato YYYY-MM-DD
     * @returns Observable con las estadísticas del dashboard
     */
    public obtenerEstadisticas(fechaInicio: string, fechaFin: string): Observable<DashboardEstadisticasDTO> {
        const params = new HttpParams()
            .set('fechaInicio', fechaInicio)
            .set('fechaFin', fechaFin);

        return this.http.get<DashboardEstadisticasDTO>(
            `${this.URL_API}/dashboard/estadisticas`,
            { params }
        );
    }
}
