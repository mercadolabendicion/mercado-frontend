import { inject, Injectable } from '@angular/core';
import { HttpDashboardService } from '../http-services/httpDashboard.service';
import { Observable } from 'rxjs';
import { DashboardEstadisticasDTO } from '../../dto/dashboard/DashboardEstadisticasDTO';
import { AlertService } from '../../utils/alert.service';
import { catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private httpDashboardService: HttpDashboardService = inject(HttpDashboardService);
    private alertService: AlertService = inject(AlertService);

    /**
     * Obtiene las estadísticas del dashboard para un rango de fechas
     * @param fechaInicio Fecha inicial en formato YYYY-MM-DD
     * @param fechaFin Fecha final en formato YYYY-MM-DD
     * @returns Observable con las estadísticas del dashboard
     */
    public obtenerEstadisticas(fechaInicio: string, fechaFin: string): Observable<DashboardEstadisticasDTO> {
        return this.httpDashboardService.obtenerEstadisticas(fechaInicio, fechaFin).pipe(
            catchError((error) => {
                console.error('Error al obtener estadísticas del dashboard:', error);
                this.alertService.simpleErrorAlert('Error al cargar las estadísticas del dashboard');
                return of({} as DashboardEstadisticasDTO);
            })
        );
    }
}
